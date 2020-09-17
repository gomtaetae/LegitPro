const {createProxyMiddleware }= require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://${process.env.IP_ADDRESS}:9000`,
      changeOrigin: true
    })
  );
};