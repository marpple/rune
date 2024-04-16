import { html, Page } from 'rune-ts';
import { MainBannerView } from '../../components/cells/MainBanner/MainBanner';

export type Meetup = Record<string, string>;

export class BannerPage extends Page<Meetup> {
  override template() {
    return html`
      <div>
        ${new MainBannerView([
          {
            information: {
              category: '테스트',
              content_number: 156,
              title: '테스트 1',
              description: '테스트',
              navigate: {},
              target: '_self',
              href: '/',
              button: {
                label: '테스트 바로가기',
              },
            },
            url: 'https://images.unsplash.com/photo-1712350529844-b953287c6c09?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            banner_background: 'red',
          },
          {
            information: {
              category: '테스트테스트테스트',
              content_number: 156,
              title: '테스트테스트테스트테스트 1',
              description: '테스트테스트테스트테스트',
              navigate: {},
              target: '_self',
              href: '/',
              button: {
                label: '테스트테스트 바로가기',
              },
            },
            url: 'https://images.unsplash.com/photo-1712350529844-b953287c6c09?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            banner_background: 'red',
          },
          {
            information: {
              category: '테스트테스트테스트테스트테스트',
              content_number: 156,
              title: '테스트테스트테스트테스트테스트테스트 1',
              description: '테스트테스트테스트테스트테스트테스트',
              navigate: {},
              target: '_self',
              href: '/',
              button: {
                label: '테스트테스트 바로가기',
              },
            },
            url: 'https://images.unsplash.com/photo-1712609036333-dff2cbe8e417?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            banner_background: 'red',
          },
          {
            information: {
              category: '테스트테스트테스트',
              content_number: 156,
              title: '테스트테스트테스트 1',
              description: '테스트테스트테스트',
              navigate: {},
              target: '_self',
              href: '/',
              button: {
                label: '테스트테스트테스트테스트 바로가기',
              },
            },
            url: 'https://images.unsplash.com/photo-1712350529844-b953287c6c09?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            banner_background: 'red',
          },
        ])}
      </div>
    `;
  }
}

export const BannerRouter = {
  ['/banner']: BannerPage,
};
