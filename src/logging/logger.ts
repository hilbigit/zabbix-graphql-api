export enum Loglevel {
    ERROR="ERROR", WARN="WARN", INFO="INFO", TRACE="TRACE", DEBUG="DEBUG"
}

export class Logger {
    public levels:Set<Loglevel> | undefined = undefined
    public logMqtt = true
    
    constructor() {
        this.readEnvironmentLogLevel()
    }

    readEnvironmentLogLevel() {
        const levels = process.env.LOG_LEVELS
        if (levels) {
            const enumLevels = levels.split(",").map(v=> Loglevel[v  as keyof typeof Loglevel])
            this.levels = new Set<Loglevel>(enumLevels)
        } 
    }

    public trace(...data: any[]) {
        if (!this.levels || this.levels.has(Loglevel.TRACE)) {
            console.log(...data)
            if (this.logMqtt) {
                // TODO Push to mqtt TEST_STATS_LOG_TOPIC topic
            }
        }
    }
    public warn(...data: any[]) {
        if (!this.levels || this.levels.has(Loglevel.WARN)) {
            console.warn(...data)
            if (this.logMqtt) {
                // TODO Push to mqtt TEST_STATS_LOG_TOPIC topic
            }
        }
    }

    public info(...data: any[]) {
        if (!this.levels || this.levels.has(Loglevel.INFO)) {
            console.log(...data)
            if (this.logMqtt) {
                // TODO Push to mqtt TEST_STATS_LOG_TOPIC topic
            }
        }
    }
    public error(...data: any[]) {
        if (!this.levels || this.levels.has(Loglevel.ERROR)) {
            console.error(...data)
            if (this.logMqtt) {
                // TODO Push to mqtt TEST_STATS_LOG_TOPIC topic
            }
        }
    }
    public debug(...data: any[]) {
        if (!this.levels || this.levels.has(Loglevel.DEBUG)) {
            console.debug(...data)
            if (this.logMqtt) {
                // TODO Push to mqtt TEST_STATS_LOG_TOPIC topic
            }
        }
    }
}

export const logger = new Logger()
