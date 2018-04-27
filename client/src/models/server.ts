export class Server {
  host: string;
  port: number;
  protocol: string;
  wampPort: number;
  wampProtocol: string;
  connected: boolean;
  session: any;


  public static getHost(server: Server) {
    return server.protocol + '://' + server.host + ':' + server.port;
  }

  public static getWampHost(server: Server) {
    return server.wampProtocol + '://' + server.host + ':' + server.wampPort;
  }
}