import { normalise } from '@ensdomains/ensjs/utils/normalise'

class ContentModifier {
  private newContent: string

  constructor(newContent: string) {
    this.newContent = newContent
  }

  element(element: Element) {
    element.setInnerContent(this.newContent)
  }
}

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url)

  const paths = url.pathname.split('/')

  let rewrite = false
  let callback: ((res: Response) => Response) | null = null

  if (paths[1] === 'my' && paths[2] === 'profile') {
    url.pathname = '/profile'
    url.searchParams.set('connected', 'true')
    rewrite = true
  } else if (paths[1] === 'names' && !!paths[2]) {
    url.pathname = '/my/names'
    url.searchParams.set('address', paths[2])
    rewrite = true
  } else if (paths[1] === 'profile' && !!paths[2]) {
    url.pathname = '/profile'
    url.searchParams.set('name', paths[2])
    rewrite = true

    const decodedName = decodeURIComponent(paths[2])
    let normalisedName: string | null = null
    try {
      normalisedName = normalise(decodedName)
      // eslint-disable-next-line no-empty
    } catch {}
    callback = (res) =>
      new HTMLRewriter()
        .on(
          'title',
          new ContentModifier(normalisedName ? `${normalisedName} on ENS` : 'Invalid Name - ENS'),
        )
        .on(
          'meta[name="description"]',
          new ContentModifier(
            normalisedName
              ? `${normalisedName}'s profile on the Ethereum Name Service`
              : `An error occurred`,
          ),
        )
        .transform(res)
  } else if (paths[1] === 'import' && !!paths[2]) {
    url.pathname = '/import'
    url.searchParams.set('name', paths[2])
    rewrite = true
  } else if (paths[1] === 'register' && !!paths[2]) {
    url.pathname = '/register'
    url.searchParams.set('name', paths[2])
    rewrite = true
  } else if (paths[1] === 'address' && !!paths[2]) {
    url.pathname = '/address'
    url.searchParams.set('address', paths[2])
    rewrite = true
  }

  if (rewrite) {
    const rewriteRequest = new Request(url.toString(), request)
    const response = await fetch(rewriteRequest)

    if (callback) {
      return callback(response)
    }

    return response
  }

  return next()
}
