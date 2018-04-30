import autobahn from 'autobahn';

export class Server {
  host: string;
  port: number;
  scheme: string;
  wampPort: number;
  wampScheme: string;
  connected: boolean;
  session: autobahn.Session;

  public static getHost(server: Server) {
    return this.buildHostUrl(server.scheme, server.host, server.port);
  }

  public static getWampHost(server: Server) {
    return this.buildHostUrl(server.wampScheme, server.host, server.wampPort);
  }

  private static buildHostUrl(scheme: string, host: string, port?: number) {
    return scheme + '://' + host + (port ? ':' + port : '');
  }
}