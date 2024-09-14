import { DurableObject } from "cloudflare:workers";

type Env = {
  Incrementer: DurableObjectNamespace<Incrementer>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Incrementer extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/reset") {
      await this.ctx.storage.deleteAll();
      return new Response("reset");
    }

    const count = await this.ctx.blockConcurrencyWhile(async () => {
      await sleep(Math.random() * 400);
      const count = (await this.ctx.storage.get<number | null>("count")) || 0;
      await this.ctx.storage.put("count", count + 1);
      return count + 1;
    });
    return new Response(count.toString());
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/increment" || url.pathname === "/reset") {
      const id = env.Incrementer.idFromName("some-id");
      const stub = env.Incrementer.get(id);
      return await stub.fetch(request);
    }
    return new Response("visit /increment");
  },
} satisfies ExportedHandler<Env>;
