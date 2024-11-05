import { Server } from "socket.io";
export class AppIOManager {
  private static io: Server;

  static init(io: Server) {
    AppIOManager.io = io;
  }
  public static send(type: string, id: string, data: any) {
    AppIOManager.io.in(id).emit(type, { data });
  }
  public static receive(type: string, data: unknown) {
    AppIOManager.io.on(type, ({ data }: { data: any }) => {
      console.log(data)
    });
  }
}
