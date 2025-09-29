/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import OpenAI from 'openai';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const openai = new OpenAI({
			apiKey: env.OPENAI_APIKEY,
		});

		try {
			const completion = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{ role: 'system', content: 'You are a helpful assistant that translates English to French.' },
					{ role: 'user', content: 'Translate the following English text to French: "Hello, how are you?"' },
				],
			});
			console.log(completion.choices[0].message);
			return new Response(completion.choices[0].message.content);
		} catch (error) {
			console.error('Error fetching OpenAI completion:', error);
			return new Response('Error fetching translation', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

// https://winter-boat-d277.nestinghaiti.workers.dev
