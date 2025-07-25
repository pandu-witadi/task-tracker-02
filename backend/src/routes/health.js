// 
// 
const healthCheck = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  });
};

module.exports = healthCheck;
