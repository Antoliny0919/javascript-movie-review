(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWNhNWM5MTZmMDhiZjlhOTNkZjcxZWJiMDU3OTljOCIsIm5iZiI6MTc3NDkxODU3OS42MTQsInN1YiI6IjY5Y2IxYmIzMDcwN2Q2MWQ2NTQyYTJiNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.d62TYMRQOEvwMv3kz_VL9KZYTZ-GntmUpTP8VIji6mk";
function handleResponseError(response) {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("인증에 실패했습니다. API 키를 확인해주세요.");
    }
    if (response.status === 404) {
      throw new Error("요청한 정보를 찾을 수 없습니다");
    }
    if (response.status >= 500) {
      throw new Error("오류가 발생했습니다. 다시 시도해주세요.");
    }
  }
}
const API_PATH = {
  POPULAR_MOVIE: "https://api.themoviedb.org/3/movie/popular",
  SEARCH_MOVIE: "https://api.themoviedb.org/3/search/movie",
  GENRE: "https://api.themoviedb.org/3/genre/movie/list"
};
const defaultOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  }
};
async function getPopularMovies(pageNum) {
  const url = `${API_PATH.POPULAR_MOVIE}?page=${pageNum}&language=ko-KR`;
  const response = await fetch(url, defaultOptions);
  handleResponseError(response);
  return response.json();
}
async function getSearchMovies(query, pageNum) {
  const url = `${API_PATH.SEARCH_MOVIE}?query=${query}&page=${pageNum}&language=ko-KR`;
  const response = await fetch(url, defaultOptions);
  handleResponseError(response);
  return response.json();
}
async function getGenres() {
  const url = `${API_PATH.GENRE}?language=ko-KR`;
  const response = await fetch(url, defaultOptions);
  handleResponseError(response);
  return response.json();
}
const starEmptyImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAxCAYAAACcXioiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQ4SURBVHgB7VlNctMwFP7UwrRl0/YGzgloNwyURd0TQE5AeoK2J2hyAuAEaU9QOEHMgvCzSW9QcwLChqbDNOI9RVEk106sWGZY5JvR+FlRJD29fxlYYYX/F/I79uQXxKgRAjWANh3Ro0ct0l0ptSPxQj2DYg31oIvZ5qHpLmpAcAno07+ZdWBIq+zoN5ZCgoCoQwLnhhK4oBUS8y7xGoFRhwT49CP9eqSfPb3aEBtoiH16BkJQCdDmW7AMl9VFq0w6GUCqdKvGBENoFXpj0R2LvjSUwCsERDAGtPHGVldiqBHeWf0xxwcEQkgJOMZr+3xxpHQ+Mb//CWfMIRmIDSUtlZlhplLrOJED41orIQgDecabHaP6pPY+E2OOEQChJFBkvC4E3lv0CQIgNw4o8Y6UiCNicQdjanxqQrVtQ0s9xk0bGkU5j+zR+E38tFa/1pF6aD1/GXrqfteJfkySzYkfImfjV8CS4mXjfY7jeUNkn+YXSxvxBR3Amc3II+fnEd4CS+tmQlH2bOGoO2JwC8umFS3aI8MckiuBPol3lnilqs3EyfjxQORjak/yxTsPStq/tYraKikMvY2pak769/SOhyTl3ek8j+aswb68g5qgGb4uM1Z+oxgzzg9+rheyvQTQll9xFcpfLwNeW9nMGG2r+4M9xmWAQ760BrCejjDQacI/hVqT1nYMXtDeMnYmCv7chp0asC2soymelRN5VcjPpC5ryhtGpnOMjnjpSEIhN5CR7reJNZvTCPckiT5OUTNIbU9oVwPYm5fkOnM2z5hb0OSeBNlGXcatjbVtdaX03qTNF0p+YUWWc8Mw1cXjUJWVchS3VPS7+s5RurnoJqNUSalSgI3MAnw6m9ivyoSO/lmVuaRgd1pm7lLJHOfz4gBNuIlaFKQ8HKlDicw7G+sBWmUPxisbVcYtrVixhqeojtiiO0XGWgT/dFqoED+BpNSiOlJrPu+g6c+AdEJ6gupIDLVEwe91L5S9dSOVqnyvpB3EjUkiN7Hr4xj8JBD+9CcFv7D8/MgvzfZjwBXxp0XDPa7XZ3NJvysXXxuILTopGsSbppRgwOkHvfb4unFBQpgYytMOSuuwo/+ZosKM4aB0R+mALMiZJGW7lLLnRddMMdUo+y3BRwKxtZEHuYlSFY6o9ualrtymEOq3nr6GcSGcOWOUhA8Dh5ht7KMhSTLUOFdy8yVWC4F91eBcdPGYLv2n66iVNSf95xAlsZwE9Gmp1FcqPY+tjQxpVk7C1Ccl3VqYFOKpNR/39UyKbktAlpeAjw1I65Xv/c+RFTWnGVuUbhf4cX3ibbgXYYxUzSlVBeZlBz4M9FCsmym147Kfj9Tt9P2DOiOLUgz4qFCnsJ/Tao9vX1ya0vjGnDnTsl7IL5XoU5Sc3GlGyhNR2Vn106lSK6lu66YBLEVNn2RrBZevqoRdYYUVvPAXJrOCc9SFL6sAAAAASUVORK5CYII=";
const noImagePlanetImg = "/javascript-movie-review/assets/no_image_planet-DQ-7fxyf.png";
const screamingPlanetImg = "/javascript-movie-review/assets/screaming_planet-BZvmNwfY.svg";
const planetAndStarImg = "/javascript-movie-review/assets/planet_and_star-CJk4xH6r.png";
const ONCE_MOVIE_LIMIT = 20;
const INITIAL_PAGE_NUM = 1;
const IMAGE_PATH = "https://image.tmdb.org/t/p/original";
const RATING_STRING = {
  2: "최악이에요",
  4: "별로에요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const Component = {
  movie(movieData) {
    const { poster_path, title, vote_average } = movieData;
    const src = poster_path ? `${IMAGE_PATH}/${poster_path}` : noImagePlanetImg;
    return `
    <li>
      <div class="item">
      <img
      class="thumbnail"
      src="${src}"
      alt="${title}"
      />
        <div class="item-desc">
          <p class="rate">
            <img src="${starEmptyImg}" class="star" /><span>${vote_average.toFixed(1)}</span>
            </p>
            <strong>${title}</strong>
        </div>
      </div>
    </li>
  `;
  },
  movieSkeleton() {
    return `
    <li class="skeleton">
      <div class="item">
        <div class="thumbnail skeleton-box"></div>
        <div class="item-desc">
          <p class="rate">
            <span class="skeleton-box skeleton-rate"></span>
          </p>
          <span class="skeleton-box skeleton-title"></span>
        </div>
      </div>
    </li>
  `;
  },
  movieBanner({
    title,
    vote_average,
    poster_path
  }) {
    return `
      <div class="top-rated-movie" style="background-image: url('${IMAGE_PATH}/${poster_path}')">
        <div class="overlay" aria-hidden="true"></div>
          <div class="container">
            <div class="rate">
              <img src="${starEmptyImg}" class="star" />
              <span class="rate-value">${vote_average.toFixed(1)}</span>
            </div>
            <div class="title">${title}</div>
            <button class="primary detail">자세히 보기</button>
          </div>
        </div>
      </div>
    `;
  },
  emptyResult() {
    return `
      <div class="notice-box">
        <img src="${screamingPlanetImg}">
        <p class="notice-text">검색 결과가 없습니다.</p>
      </div>
      `;
  },
  error(message) {
    return `
      <div class="notice-box">
        <img src="${planetAndStarImg}">
        <span class="notice-text">${message}</span>
      </div>
    `;
  }
};
function observeHeaderScroll() {
  const topRatedMovie = document.querySelector(".top-rated-movie");
  const header = document.querySelector(".background-container");
  if (topRatedMovie && header) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle("scrolled", !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(topRatedMovie);
  }
}
const starFilledImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAxCAYAAACcXioiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKXSURBVHgB7ZhBbtQwFIZ/zyAxu8IN0hNANqh0Q+YG9ASlJyhzgpmeADgBvQG9QbOCJXMDwgnIqoyEqPnjcWmVxElsPU9bKZ/kZuQ4rp/f+/OeA4yMjDxqFCKhvyHh7B+gUWKGhUp5jcATxGPJxb81v67wk39XiMAE8cj+/5riVH/HM0QgigEMn3e8JLcdXPzvOwYJEssDx40ehVNEQFzERrzAj9abU6TqFdYQJIYHls47f6yoBYlhQOa8E0HMogY0xNsYIC9maQ8c944QFrOYiDvFW2eG51KZWdIDy8Ejr/AeQnh7wIhwwzZl+8s2YbvGC/iXCmd8ds1nS85Vcq6qZip9PdNqAMOh2s3ENMUFattUnHKguQAaoYwhBbarLNm3Vq9pdI2GAfZN8hkPEc2q9hAf73ZNWgbtZpdDUM3wahhgLTzDQ0PjE0PovN7tFDFDaQWfN0tMWkLnhs63EI3IsNVDgvtgK+Yj7nzuGtL7GrUJ6hK7N6Jgm3PxRdeg3kRmJ5iz5dgdOXNC2rf4Cq9EthNdVGI9HJ6p/TNxTCM6xOoiqJjTX3kwUfgCWeZdYnURXI3SE1XlmUCGgovfRwBhHrhktp7hFyQJLLHDyukZXkKaTdicYQZo+cN56JyhB5o3kCdoTv/XaIz4vyFAB/4eeBrnE6Eh4ItFSAhlA8cVbCe2FQOfyeBJiAH9scpywNYy56aG3yA1fRJz1/CrhfriX/GQXpUDjow6qLL11IGfB1zxr82he6EOzK7nrser6tJmXPeJz1MHfgao1mSTsz/1KcJoxIqXfT530XI7gwd+BlzzH2rr3u31hIuZD6nb6xhvHOAIdZFPsAcPQsrpBNUuzXAh9XnQzrnipuxxRYuQDRkZGRm5H/4BIkyx5W7xkPAAAAAASUVORK5CYII=";
const IndexRenderer = {
  renderInitialMovies(movies) {
    const movieList = document.querySelector(".thumbnail-list");
    const banner = document.querySelector(".banner-container");
    if (banner) {
      Renderer.renderBanner(banner, movies[0]);
      observeHeaderScroll();
    }
    if (movieList) {
      Renderer.clearSkeleton(movieList);
      Renderer.renderMovies(movieList, movies);
    }
    this.renderSectionHeading();
  },
  renderSectionHeading() {
    const heading = document.querySelector("section > h2");
    if (heading instanceof HTMLElement) {
      heading.innerHTML = `지금 인기 있는 영화`;
    }
  }
};
const SearchRenderer = {
  renderSearchResult(movies, query) {
    const movieList = document.querySelector(".thumbnail-list");
    Renderer.clearBanner();
    Renderer.clearMovies();
    Renderer.clearEmptyResult();
    this.renderSearchSectionHeading(query);
    if (movies.length === 0) Renderer.renderEmptyResult();
    else if (movieList) Renderer.renderMovies(movieList, movies);
  },
  renderSearchSectionHeading(title) {
    const heading = document.querySelector("section > h2");
    if (heading instanceof HTMLElement) {
      heading.innerHTML = `"${title}"검색 결과`;
      heading.style.marginTop = "12rem";
    }
  }
};
const MovieDetailRenderer = {
  renderMovieDetail(movieData, releaseYear, genres, rating) {
    const { id, title, poster_path, vote_average, overview } = movieData;
    const movieContainer = document.querySelector(
      "#movie-detail-container"
    );
    const movieTitle = document.querySelector("#movie-detail-title");
    const moviePoster = document.querySelector("#movie-detail-poster");
    const movieVoteAverage = document.querySelector(
      "#movie-detail-vote-average"
    );
    const movieOverview = document.querySelector("#movie-detail-overview");
    const movieReleaseYear = document.querySelector(
      "#movie-detail-release-year"
    );
    const movieGenres = document.querySelector("#movie-detail-category");
    if (!movieTitle || !movieVoteAverage || !movieOverview || !movieReleaseYear || !movieGenres)
      return;
    if (movieContainer) movieContainer.dataset.movieId = String(id);
    movieTitle.innerHTML = title;
    if (moviePoster instanceof HTMLImageElement)
      moviePoster.src = `${IMAGE_PATH}/${poster_path}`;
    movieVoteAverage.innerHTML = vote_average.toFixed(1);
    movieOverview.innerHTML = overview;
    movieReleaseYear.innerHTML = String(releaseYear);
    movieGenres.innerHTML = genres.join(", ");
    this.renderMyRating(rating);
  },
  renderMyRating(rating) {
    const myRating = document.querySelectorAll("#my-rating button");
    const myRatingToString = document.querySelector("#my-rating-to-string");
    const myRatingRatio = document.querySelector("#my-rating-ratio");
    myRating.forEach((button) => {
      const backgroundImage = button.querySelector("img");
      if (!backgroundImage) return;
      if (rating >= Number(button.dataset.rating)) {
        backgroundImage.src = starFilledImg;
      } else {
        backgroundImage.src = starEmptyImg;
      }
    });
    if (myRatingToString)
      myRatingToString.innerHTML = RATING_STRING[rating] ?? "";
    if (myRatingRatio instanceof HTMLElement)
      myRatingRatio.innerHTML = `(${rating}/${Object.keys(RATING_STRING).slice(-1)})`;
  },
  clearMovieDetail() {
    const modal = document.querySelector("#modalBackground");
    modal?.remove();
    document.body.classList.remove("modal-open");
  }
};
const Renderer = {
  renderMovies(parent, movies) {
    const movieListComponent = movies.map((movie) => Component.movie(movie)).join("");
    parent.insertAdjacentHTML("beforeend", movieListComponent);
  },
  clearMovies() {
    const movieList = document.querySelector(".thumbnail-list");
    if (movieList) movieList.innerHTML = "";
  },
  renderBanner(parent, { title, vote_average, poster_path }) {
    parent.innerHTML = Component.movieBanner({
      title,
      vote_average,
      poster_path
    });
  },
  clearBanner() {
    const banner = document.querySelector(".banner-container");
    if (banner) banner.innerHTML = "";
  },
  renderEmptyResult() {
    const section = document.querySelector("section");
    const node = document.createElement("div");
    node.innerHTML = Component.emptyResult();
    section?.appendChild(node);
  },
  clearEmptyResult() {
    const emptyResult = document.querySelector(".empty-result");
    emptyResult?.remove();
  },
  renderSkeleton(selector, length) {
    const target = document.querySelector(selector);
    if (target instanceof HTMLElement) {
      target.insertAdjacentHTML(
        "beforeend",
        Array.from({ length }).map(() => Component.movieSkeleton()).join("")
      );
    }
  },
  clearSkeleton(parent) {
    parent.querySelectorAll(".skeleton").forEach((el) => el.remove());
  },
  renderLoadMoreMovies(movies) {
    const movieList = document.querySelector(".thumbnail-list");
    if (movieList) {
      Renderer.clearSkeleton(movieList);
      Renderer.renderMovies(movieList, movies);
    }
  },
  renderError(err) {
    const message = err instanceof Error ? err.message : "에러가 발생했습니다.";
    const content = document.querySelector(".thumbnail-list");
    if (content) content.innerHTML = Component.error(message);
  }
};
const State = {
  nextPageNum: 0,
  nextSearchPageNum: 0,
  requestMovieCount: 0,
  searchQuery: "",
  genres: [],
  isLoading: false,
  totalPages: 0,
  totalSearchPages: 0
};
const MovieDetail = {
  setUpEventListeners() {
    this.setUpDialogCloser();
    this.setUpMyRatingToMovie();
  },
  setUpDialogCloser() {
    const dialog = document.querySelector("dialog");
    const dialogCloser = document.querySelector("#closeModal");
    dialogCloser?.addEventListener("click", () => {
      if (dialog) dialog.close();
    });
  },
  setUpMovieDetail(moviesData) {
    const movieList = [
      ...document.querySelectorAll(".thumbnail-list li")
    ].slice(-moviesData.length);
    movieList.forEach((movie, idx) => {
      movie.addEventListener("click", (e) => {
        e.preventDefault();
        const dialog = document.querySelector("dialog");
        const movieData = moviesData[idx];
        const [movieGenres, rating] = this.extractDetailMovieData(movieData);
        MovieDetailRenderer.renderMovieDetail(
          movieData,
          new Date(movieData.release_date).getFullYear(),
          movieGenres,
          rating
        );
        dialog?.showModal();
      });
    });
  },
  setUpMyRatingToMovie() {
    const ratingButtons = document.querySelectorAll(
      ".modal .my-rating-container button"
    );
    ratingButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const myRating = e.currentTarget.dataset.rating;
        const movieContainer = document.querySelector(
          "#movie-detail-container"
        );
        const movieId = movieContainer.dataset.movieId;
        this.setMyRating(`movie-${movieId}-my-rating`, String(myRating));
        MovieDetailRenderer.renderMyRating(myRating ? Number(myRating) : 0);
      });
    });
  },
  extractDetailMovieData(movie) {
    const genres = State.genres;
    const movieGenres = movie.genre_ids.map(
      (genreId) => genres.find((genre) => genre.id === genreId).name
    );
    const currentRating = this.getMyRating(`movie-${movie.id}-my-rating`);
    return [movieGenres, currentRating];
  },
  getMyRating(key) {
    return Number(localStorage.getItem(key));
  },
  setMyRating(key, rating) {
    localStorage.setItem(key, rating);
  }
};
const Search = {
  async showSearchMovies(query) {
    State.isLoading = true;
    Renderer.renderSkeleton(".thumbnail-list", State.requestMovieCount);
    try {
      const {
        results: movies,
        page,
        total_pages
      } = await getSearchMovies(query, INITIAL_PAGE_NUM);
      SearchRenderer.renderSearchResult(movies, query);
      State.nextSearchPageNum = page + 1;
      State.totalSearchPages = total_pages;
      State.searchQuery = query;
      MovieDetail.setUpMovieDetail(movies);
    } catch (err) {
      Renderer.renderError(err);
    } finally {
      State.isLoading = false;
    }
  },
  async showMoreSearchMovies(query) {
    State.isLoading = true;
    Renderer.renderSkeleton(".thumbnail-list", State.requestMovieCount);
    try {
      const {
        results: movies,
        page,
        total_pages
      } = await getSearchMovies(query, State.nextSearchPageNum);
      State.nextSearchPageNum = page + 1;
      State.totalSearchPages = total_pages;
      Renderer.renderLoadMoreMovies(movies);
      MovieDetail.setUpMovieDetail(movies);
    } catch (err) {
      Renderer.renderError(err);
    } finally {
      State.isLoading = false;
    }
  }
};
const Index = {
  init() {
    this.setUpInitialContent();
    this.setUpEventListeners();
  },
  setUpInitialContent() {
    addEventListener("load", () => this.showPopularMovies());
  },
  setUpEventListeners() {
    this.setUpLoadMoreMovies();
    this.setUpSearchForm();
    MovieDetail.setUpEventListeners();
  },
  setUpLoadMoreMovies() {
    const endOfThumbnailList = document.querySelector("#end-of-thumbnail-list");
    if (endOfThumbnailList) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (State.isLoading) return;
          const query = State.searchQuery;
          const nextPage = query ? State.nextSearchPageNum : State.nextPageNum;
          const totalPage = query ? State.totalSearchPages : State.totalPages;
          if (totalPage === 0 || nextPage > totalPage) return;
          this.handleLoadMoreMovies();
        },
        { threshold: 0.8 }
      );
      observer.observe(endOfThumbnailList);
    }
  },
  setUpSearchForm() {
    const searchForm = document.querySelector(".search-form");
    searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = searchForm.querySelector("input");
      if (input) {
        const searchValue = input.value;
        Search.showSearchMovies(searchValue);
      }
    });
  },
  handleLoadMoreMovies() {
    const query = State.searchQuery;
    if (query) {
      Search.showMoreSearchMovies(query);
    } else {
      this.showMoreMovies();
    }
  },
  async showPopularMovies() {
    const app = document.querySelector("#app");
    if (app) {
      State.isLoading = true;
      Renderer.renderSkeleton(
        ".thumbnail-list",
        State.requestMovieCount || ONCE_MOVIE_LIMIT
      );
      try {
        const [{ results: movies, page, total_pages }, { genres }] = await Promise.all([getPopularMovies(INITIAL_PAGE_NUM), getGenres()]);
        State.nextPageNum = page + 1;
        State.totalPages = total_pages;
        State.requestMovieCount = movies.length;
        State.genres = genres;
        IndexRenderer.renderInitialMovies(movies);
        MovieDetail.setUpMovieDetail(movies);
      } catch (err) {
        Renderer.renderError(err);
      } finally {
        State.isLoading = false;
      }
    }
  },
  async showMoreMovies() {
    State.isLoading = true;
    Renderer.renderSkeleton(".thumbnail-list", State.requestMovieCount);
    try {
      const {
        results: movies,
        page,
        total_pages
      } = await getPopularMovies(State.nextPageNum);
      State.nextPageNum = page + 1;
      State.totalPages = total_pages;
      Renderer.renderLoadMoreMovies(movies);
      MovieDetail.setUpMovieDetail(movies);
    } catch (err) {
      Renderer.renderError(err);
      Renderer.clearBanner();
    } finally {
      State.isLoading = false;
    }
  }
};
Index.init();
