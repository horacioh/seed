import {z} from 'zod'
import {t} from './app-trpc'

const registerInputSchema = z.object({
  url: z.string(),
  payload: z.any(),
})

export const sitesApi = t.router({
  registerSite: t.procedure
    .input(registerInputSchema)
    .mutation(async ({input}) => {
      const resp = await fetch(input.url, {
        method: 'POST',
        body: JSON.stringify(input.payload),
      })
      if (resp.status !== 200) {
        console.error('site registration error')
        console.error(resp)
        console.error(await resp.text())
        throw new Error(`Failed to register`)
      }
      const result = await resp.json()
      return result
    }),
})
