// Pinterest
class Media {
  constructor(containerId, ...tags) {
    this.container = document.getElementById(containerId);
    this.tagContainer = document.getElementById('tags');
    this.tags = tags;
    this.activeTagIndex = 0;
    this.loadedCount = 0;
    this.perLoad = 6;
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) this.loadMore();
    });
    this.loadByTag(0);
  }

  async getMedia(tag) {
    const baseUrl = 'https://widgets.pinterest.com/v3/pidgets/';
    const endpoint = tag === 'All' ? `users/headlesshorse/pins/` : `boards/headlesshorse/${tag}/pins/`;
    const apiUrl = `${baseUrl}${endpoint}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Network Error');
    const pinsData = await response.json();
    const filteredPins = pinsData.data.pins.filter(pin =>
      !(pin.board?.url?.includes('by-headless-horse'))
    );
    return filteredPins;
  }

  async loadByTag(index) {
    this.activeTagIndex = index;
    this.feed = await this.getMedia(this.tags[index]);
    this.loadedCount = 0;
    this.render();
  }

  loadMore() {
    this.render();
  }

  render() {
    const feedItems = this.feed.slice(0, this.loadedCount += this.perLoad);
    this.container.innerHTML = feedItems.map(({ images, link, id }) => {
      const image = images['237x'].url;
      const cleanLink = link?.replace(/^https?:\/\/(www\.)?/i, '');
      return `<figure><img src="${image}" style="filter: grayscale(50%) contrast(.8) brightness(.9)"><figcaption><a href="${cleanLink ? link : `https://pinterest.com/pin/${id}`}" target="_blank">${cleanLink ? `Source: ${cleanLink}` : 'Source: Unavailable'}</a></figcaption></figure>`;
    }).join('');

    if (this.loadedCount < this.feed.length) {
      const sentinel = document.createElement('div');
      sentinel.id = 'sentinel';
      this.container.appendChild(sentinel);
      this.observer.observe(sentinel);
    }
    this.renderTags();
  }

  renderTags() {
    this.tagContainer.innerHTML = this.tags.map((tag, index) => `
      <li>
        ${index === this.activeTagIndex ? '[▪]' : '[ ]'}
        <a onclick="media.loadByTag(${index})">${tag}</a>
      </li>
    `).join('');
  }
}

const media = new Media('media', 'All', 'Direction', 'Graphic', 'Wellness', 'Print', 'Space', 'Style');