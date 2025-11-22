import { Template } from 'e2b'

export const template = Template()
  .fromImage('e2bdev/base:latest')
  .setUser('root')
  .setWorkdir('/')
  .runCmd('curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs && node --version && npm --version')
  .setWorkdir('/workspace')
  .runCmd('npm install -g typescript tsx')
  .setUser('user')
  .setWorkdir('/home/user')