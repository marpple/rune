import { StringDecoder } from 'string_decoder';
import { setManifest } from '../../shared/manifest';
import fs from 'fs';

let serverManifest = {};
const setClientManifest = (dir: string) => {
  setManifest(() => {
    return JSON.parse(new StringDecoder('utf-8').write(fs.readFileSync(`${dir}/manifest.json`)));
  });
};

const setServerManifest = (dir: string) => {
  try {
    serverManifest = JSON.parse(new StringDecoder('utf-8').write(fs.readFileSync(`${dir}/manifest.json`)));
  } catch (e) {
    serverManifest = {};
  }
};

export { setClientManifest, setServerManifest, serverManifest };
