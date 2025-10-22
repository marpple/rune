import { globals, setGlobal } from './global';

const setManifest = (callback) => {
  try {
    const manifest = callback();
    setGlobal('manifest', manifest);
  } catch (e) {
    setGlobal('manifest', {});
  }
};

const getManifest = () => {
  return globals.get('manifest');
};

export { getManifest, setManifest };
