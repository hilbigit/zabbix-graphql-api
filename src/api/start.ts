import http from "http";
import {schema_loader} from "./schema.js";
import {GraphQLSchema} from "graphql/type";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from '@as-integrations/express4';
import express from 'express';

import cors from "cors";
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {logger} from "../logging/logger.js";
import {zabbixAPI, zabbixRequestAuthToken} from "../datasources/zabbix-api.js";
import {WebSocketServer} from "ws";
import {useServer} from "graphql-ws/lib/use/ws";

const GRAPHQL_PATH = "/"
const GRAPHQL_PORT = 4000

export function startAPi() {
    startApolloServer().then(
        r => {
            logger.info(`🚀 API ready at http://localhost:` + GRAPHQL_PORT + GRAPHQL_PATH);
        });
}


async function startApolloServer() {
    return schema_loader().then(async (executableSchema: GraphQLSchema) => {
        // Required logic for integrating with Express
        const app = express();
        // Our httpServer handles incoming requests to our Express app.
        // Below, we tell Apollo Server to "drain" this httpServer,
        // enabling our servers to shut down gracefully.
        const httpServer = http.createServer(app);

        const wsServer = new WebSocketServer({
            // This is the `httpServer` we created in a previous step.
            server: httpServer,
            // Pass a different path here if app.use
            // serves expressMiddleware at a different path
            path: GRAPHQL_PATH,
        });

        // Hand in the schema we just created and have the
        // WebSocketServer start listening.
        const serverCleanup = useServer({schema: executableSchema}, wsServer);
        const server: ApolloServer = new ApolloServer({
            schema: executableSchema,
            plugins: [
                // Proper shutdown for the HTTP server.
                ApolloServerPluginDrainHttpServer({httpServer}),

                // Proper shutdown for the WebSocket server.
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                await serverCleanup.dispose();
                            },
                        };
                    },
                },
            ],
        });


        await server.start();


        // Set up our Express middleware to handle CORS, body parsing,
        // and our expressMiddleware function.
        app.use(
            GRAPHQL_PATH,
            cors<cors.CorsRequest>(),
            express.json(),
            // expressMiddleware accepts the same arguments:
            // an Apollo Server instance and optional configuration options
            expressMiddleware(server, {
                context: async ({req}) => {
                    const {cache} = server;
                    return {
                        cache,
                        dataSources: {
                            zabbixAPI: zabbixAPI,
                        },
                        zabbixAuthToken: req.headers["zabbix-auth-token"] ?? zabbixRequestAuthToken,
                        cookie: req.headers.cookie,
                        token: req.headers.token
                    };
                },
            }),
        );

        // Modified server startup
        await new Promise<void>((resolve) => httpServer.listen({port: GRAPHQL_PORT}, resolve));

    });

}
