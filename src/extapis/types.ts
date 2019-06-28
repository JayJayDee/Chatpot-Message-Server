import { Member, Room } from '../common-types';

export namespace ExtApiTypes {
  export enum RequestMethod {
    POST = 'post', GET = 'get'
  }
  export type RequestParam = {
    uri: string,
    method: RequestMethod,
    qs?: {[key: string]: any};
    body?: {[key: string]: any};
    headers?: {[key: string]: any};
  };
  export type Request = (param: RequestParam) => Promise<any>;

  export namespace Auth {
    export type RequestMembers = (memberNos: number[]) => Promise<Member[]>;
  }
  export namespace Room {
    export type RequestRooms = (roomNos: number[]) => Promise<Room[]>;
    export type RequestMyRooms = (memberToken: string) => Promise<string[]>;
  }
}