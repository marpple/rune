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
              category: '배너 카테고리',
              content_number: 157,
              title: '배너 테스트',
              description: '배너 설명',
              navigate: {},
              target: '_self',
              button: {
                label: '배너 바로가기',
              },
            },
            url: 'https://plus.unsplash.com/premium_photo-1711508491855-22fd09a18bc2?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            banner_background: 'red',
          },
          {
            information: {
              category: '배너 카테고리',
              content_number: 157,
              title: '배너 테스트',
              description: '배너 설명',
              navigate: {},
              target: '_self',
              button: {
                label: '배너 바로가기',
              },
            },
            url: 'https://images.unsplash.com/photo-1712337646541-d0c6f85447f8?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            banner_background: 'red',
          },
          {
            information: {
              category: '배너 카테고리',
              content_number: 157,
              title: '배너 테스트',
              description: '배너 설명',
              navigate: {},
              target: '_self',
              button: {
                label: '배너 바로가기',
              },
            },
            url: 'https://plus.unsplash.com/premium_photo-1711508491855-22fd09a18bc2?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
