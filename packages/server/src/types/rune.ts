import { type Configuration } from 'webpack';

export interface RuneConfigType {
  /* 해당 앱의 이름 */
  name: string;
  /* 해당 서버의 모드 'render', 'server'(클라이언트 번들링을 하지 않음) */
  mode: 'server' | 'render';
  /* 서버가 뜨는 포트 */
  port: number;
  /* 서버에서 사용할 호스트이름 */
  hostname?: string;
  /* 개발 시 수정되면 재시작하는 패스 */
  watchToReloadPaths?: string[];
  /* 클라이언트 동적 import를 통해 청크를 생성합니다. runtime에서 청크파일을 가져옵니다. */
  dynamicChunk?: boolean;
  /* 서버 동적 import를 통해 청크를 생성합니다. runtime에서 청크파일을 가져옵니다. */
  serverDynamicChunk?: boolean;
  /* 디버깅이 용이하게 콘솔이 자세하게 나타납니다. */
  debug?: boolean;
  /* 개발 환경 시 router 교체가 아닌 process 교체하는 옵션입니다. 속도는 느리지만 확실한 재시작을 할 수 있습니다. */
  processReload?: boolean;
  /* 웹팩 번들 시 확인하지 않는 패스 */
  watchToIgnorePaths?: string[];
  /* 서버 콘솔 기록 시 무시하는 서버의 라우터 */
  morganSkipPaths?: string[];
  /* 추가로 등록되어야 하는 env 파일들 */
  envFiles?: string[];
  /* 클라이언트 엔트리 */
  clientEntry?: string;
  /* 서버 엔트리 */
  serverEntry?: string;
  /* sass loader 옵션 */
  sassOptions?: {
    /* sass js api 버전 - 기존 사용자들은 legacy에서 modern-compiler로 마이그레이션 필요 */
    api?: 'legacy' | 'modern-compiler';
    /* legacy일때 sass loader가 해석 시 추가될 경로 */
    includePaths?: string[];
    /* modern-compiler일때 sass loader가 해석 시 추가될 경로 */
    loadPaths?: string[];
    /* 모든 sass파일 최상단에 추가되는 텍스트 */
    additionalData: string;
  };
  /* 웹팩 번들 분석 */
  showBundleAnalyzer?: boolean;
  /* 웹팩 번들 시 manifest에 추가되는 패스 */
  publicPath?: string;
  /* 번들된 파일이 아닌 직접 파일을 조회해서 번들 시도 */
  internalModules?: RegExp[];
  /* 클라이언트 번들 시 webpack config를 최종 수정할 수 있는 함수 */
  clientWebpackFinal?: (webpackConfig: Configuration, isDev: boolean) => Configuration;
  /* 서버 번들 시 webpack config를 최종 수정할 수 있는 함수 */
  serverWebpackFinal?: (webpackConfig: Configuration, isDev: boolean) => Configuration;
}
