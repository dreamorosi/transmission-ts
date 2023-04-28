interface SessionService {
  getSessionId(): Promise<string>;
  resetSessionId(): void;
}

type SessionServiceConfig = {
  pathname: string;
  authorization: string;
};

export { SessionService, SessionServiceConfig };
