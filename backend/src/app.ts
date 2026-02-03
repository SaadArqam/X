import {Server} from "./server/Server"

const server=new Server()

export const app=server.getApp()