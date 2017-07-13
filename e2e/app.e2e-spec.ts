import { NgxTreePage } from './app.po';

describe('ngx-tree App', () => {
  let page: NgxTreePage;

  beforeEach(() => {
    page = new NgxTreePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
