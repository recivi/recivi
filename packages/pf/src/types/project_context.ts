import type { AstroConfig } from 'astro'

export interface ProjectContext extends Pick<
  AstroConfig,
  'site' | 'base' | 'trailingSlash' | 'root' | 'srcDir' | 'publicDir' | 'build'
> {
  hasManifestIcons: boolean
}
