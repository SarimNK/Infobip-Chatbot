import { Infobip, AuthType } from "@infobip-api/sdk";
import Fastify from "fastify";
import "dotenv/config";

//configuring fastify
const fastify = Fastify({
    logger: true,
});

//setup
const infobip = new Infobip({
    baseUrl: String(process.env.INFOBIP_BASE_URL),
    apiKey: String(process.env.INFOBIP_API_KEY),
    authType: AuthType.ApiKey,
});


fastify.get('/send-test', async () => {
    try {
        await infobip.channels.sms.send({
            messages: [
                {
                    destinations: [{
                        to: '437xxxxxxxx'
                    }],
                    from: '12268280734',
                    text: 'HelloWorld!!'
                }
            ]
        });
        fastify.log.info('HelloWorld Message!');
        return {};
    } catch (error) {
        fastify.log.error(error)
    }
});

//receiving messages
fastify.post('/inbound-sms', async (request: any, reply)  => {
    //fastify.log.info(request.body);
    const { results } = request.body;
    results.forEach(async (message: any) => {
        const { from, to, text } = message;
        let returnMessage = 'testing';
        switch(text) {
            case "hi":
                returnMessage = 'Hello from my crumby bot';
                break;
            case "bye":
                returnMessage = 'Sorry this sucked';
                break;
            default:
                // Do smart other things
        }
        const ibResp = await infobip.channels.sms.send({
            messages: [
                {
                    destinations: [{
                        to: from
                    }],
                    from: to,
                    text: returnMessage,
                }
            ]
        });
        fastify.log.info(ibResp.data);
    });
    return {
        message: 'success',
    };
});

//run server
const start = async () => {
    try {
      const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
      const HOST = process.env.PORT ? "0.0.0.0" : "127.0.0.1";
      await fastify.listen({ port: PORT, host: HOST });
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();