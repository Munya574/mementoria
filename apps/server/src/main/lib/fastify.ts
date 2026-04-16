import Fastify from "fastify";

export const fastify = Fastify({
  logger: true,
  bodyLimit: 52428800, // 50MB — accommodates base64-encoded images and audio
});
