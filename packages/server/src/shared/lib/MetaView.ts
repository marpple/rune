import { entries, map, pipe, reduce } from '@fxts/core';
import { html, Layout, Page, UnsafeHtml } from 'rune-ts';
import { JS_FILES, STYLE_SHEET_FILES } from '../constants';
import { getManifest } from '../manifest';

export interface OGTagData {
  property: string;
  content: string;
  type?: string;
  image?: string;
  url?: string;
}

export interface MetaTagData {
  name?: string;
  content?: string;
  charset?: string;
}

export interface LinkTagData {
  rel: string;
  href: string;
  as?: string;
  type?: string;
  sizes?: string;
}

export interface ScriptData {
  src: string;
}

export interface LayoutHeadData {
  title?: string;
  description?: string;
  open_graph_tags?: OGTagData[];
  meta_tags?: (MetaTagData & Record<string, string>)[];
  link_tags?: LinkTagData[];
}

export interface LayoutData {
  /*
   * html에 들어가는 attribute를 지정할 수 있습니다. id는 pc, mo 둘 중 하나로 강제됩니다. 기본 값은 pc입니다.
   * */
  html?: Record<string, string> & { id?: 'pc' | 'mo' };

  /*
   * head에 들어갈 태그들을 설정할 수 있습니다. title, description은 필수 입니다.
   * */
  head?: LayoutHeadData;

  body?: {
    /*
     * 추가적인 스크립트를 설정할 수 있습니다.
     * */
    scripts?: ScriptData[];
  };
}

const toStrReduce = (pre: any, val: any) => `${pre}${val}`;

const strMap = <T>(iter: IterableIterator<T> | Generator<T> | T[], fn: (val: T) => string): string => {
  return pipe(
    iter,
    map((v) => fn(v)),
    reduce(toStrReduce),
  );
};

const createTags = <T extends Record<string, any>>(
  tag_data: T[],
  makeTagFunction: (entry: ReturnType<typeof entries<T>>) => string,
) => {
  return html.preventEscape(
    pipe(
      tag_data,
      map((meta_tag) => makeTagFunction(entries(meta_tag))),
      reduce(toStrReduce),
    ),
  );
};

const createAttributes = (attributes: LayoutData['html']): UnsafeHtml => {
  if (attributes) {
    return html.preventEscape(
      pipe(attributes, entries, (entry) => strMap(entry, ([key, value]) => ` ${key}="${value}"`)),
    );
  }

  return html.preventEscape('');
};

const createOGTags = (og_tags: LayoutHeadData['open_graph_tags']): UnsafeHtml => {
  if (og_tags) {
    return createTags(og_tags, (entry) => {
      return `<meta ${strMap(entry, ([key, value]) => {
        if (key === 'property') {
          value = 'og:' + value;
        }

        return ` ${key}="${value}"`;
      })} />`;
    });
  }

  return html.preventEscape('');
};

const createMetaTags = (meta_tags: LayoutHeadData['meta_tags']): UnsafeHtml => {
  if (meta_tags) {
    return createTags(meta_tags, (entry) => {
      return `<meta ${strMap(entry, ([key, value]) => {
        return ` ${key}="${value}"`;
      })} />`;
    });
  }

  return html.preventEscape('');
};

const createLinkTag = (link_tags: LayoutHeadData['link_tags']): UnsafeHtml => {
  if (link_tags) {
    return createTags(link_tags, (entry) => {
      return `<link ${strMap(entry, ([key, value]) => {
        return ` ${key}="${value}"`;
      })} />`;
    });
  }

  return html.preventEscape('');
};

const createScriptTag = (scripts?: ScriptData[]): UnsafeHtml => {
  if (scripts) {
    return createTags(scripts, (entry) => {
      return `<script ${strMap(entry, ([key, value]) => {
        return ` ${key}="${value}"`;
      })} ></script>`;
    });
  }

  return html.preventEscape('');
};

const createStyleSheetTag =
  (manifest?: Record<string, string>) =>
  (style_sheet: string): string => {
    manifest = manifest ?? {};
    const file = manifest[style_sheet];
    return file ? `<link rel="stylesheet" href="${manifest[style_sheet]}" />` : '';
  };

const createJsEntryTag = (manifest?: Record<string, string>) => (js_file_name: string) => {
  manifest = manifest ?? {};
  const file = manifest[js_file_name];
  return file ? `<script crossorigin="anonymous" src="${manifest[js_file_name]}"></script>` : '';
};

export class MetaView extends Layout<LayoutData> {
  htmlAttribute: UnsafeHtml;
  openGraph: UnsafeHtml;
  meta: UnsafeHtml;
  link: UnsafeHtml;
  styleSheet: UnsafeHtml;
  entryScript: UnsafeHtml;
  extraScript: UnsafeHtml;

  constructor(page: Page<object>, data: LayoutData) {
    super(data, page);

    this.htmlAttribute = createAttributes(data.html);
    this.openGraph = createOGTags(data.head?.open_graph_tags);
    this.meta = createMetaTags(data.head?.meta_tags);
    this.link = createLinkTag(data.head?.link_tags);

    this.extraScript = createScriptTag(data.body?.scripts);

    const manifest = getManifest();

    this.styleSheet = html.preventEscape(`
      ${strMap(STYLE_SHEET_FILES, createStyleSheetTag(manifest))}
    `);

    this.entryScript = html.preventEscape(`
      ${strMap(JS_FILES, createJsEntryTag(manifest))}
    `);
  }

  override template(data: LayoutData) {
    return html`
      <!doctype html>

      <html ${this.htmlAttribute}>
        <head>
          ${this.openGraph} ${this.meta} ${data.head?.title ? html`<title>${data.head.title}</title>` : ''}
          ${data.head?.description ? html`<meta name="description" content="${data.head.description}" />` : ''}
          ${this.link} ${this.styleSheet}
        </head>
        <body>
          <div id="body">${this.page.toHtmlSSR()}</div>
          <div>${this.entryScript}</div>
        </body>
        ${this.extraScript}
      </html>
    `;
  }
}
