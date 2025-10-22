import { $, CustomEventWithDetail, Page } from 'rune-ts';
import type { Router, RuneRouter } from '../../shared';

export interface InitialData {
  props: {
    key: string;
    sharedData: any;
    data: any;
  };
  el: Element;
}

function getInitialData(): InitialData {
  const script = document.querySelector('script.__RUNE_DATA__[data-rune-base-name="Page"]');
  if (!script) {
    throw new Error('No __RUNE_DATA__ script found');
  }

  const props: InitialData['props'] = JSON.parse(script.textContent!);
  const el = $(script)?.prev('[data-rune]')?.element();

  if (!el) {
    throw new Error('No RUNE VIEW found');
  }

  script.remove();
  return { props, el };
}

export class HydratedEvent extends CustomEventWithDetail<Page<object>> {}

export const hydrate = <T extends RuneRouter<Router>>(router: T) => {
  const initialData = getInitialData();
  const _router = router[initialData.props.key];
  const client = _router(initialData.props.data, initialData.props.sharedData);

  const page = client.hydrateFromSSR(initialData.el as HTMLElement);
  page.dispatchEvent(HydratedEvent, { detail: page });

  return page;
};
