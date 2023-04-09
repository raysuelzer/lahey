import express from 'express';

export class KeepAliveServer {
  server: express.Express;
  constructor() {
    this.server = express();
    this.server.all('/', (req, res) => {
      res.send(`OK`)
    })
  }

  public keepAlive() {
    this.server.listen(80, () => { console.log("Server is Ready!!" + Date.now()) });
  }
}




