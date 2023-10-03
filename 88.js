function constructor(opts = {}) {
    super();

    this.clients = {};
    this.clientsCount = 0;

    this.opts = Object.assign(
      {
        wsEngine: process.env.EIO_WS_ENGINE || "ws",
        pingTimeout: 5000,
        pingInterval: 25000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e6,
        transports: Object.keys(transports),
        allowUpgrades: true,
        perMessageDeflate: {
          threshold: 1024
        },
        httpCompression: {
          threshold: 1024
        },
        cors: false
      },
      opts
    );

    if (opts.cookie) {
      this.opts.cookie = Object.assign(
        {
          name: "io",
          path: "/",
          httpOnly: opts.cookie.path !== false,
          sameSite: "lax"
        },
        opts.cookie
      );
    }

    if (this.opts.cors) {
      this.corsMiddleware = require("cors")(this.opts.cors);
    }

    this.init();
  }