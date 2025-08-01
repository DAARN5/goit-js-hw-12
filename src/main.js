import './css/styles.css';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
  scrollPage
} from './js/render-functions';
import { getImagesByQuery } from './js/pixabay-api';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

let currentQuery = '';
let currentPage = 1;
const perPage = 15;
let totalHits = 0;

const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.load-more');

hideLoadMoreButton();

form.addEventListener('submit', async e => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) {
    iziToast.warning({ message: 'Please enter a search query.' });
    return;
  }

  currentQuery = query;
  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    const { hits, totalHits: total } = data;
    totalHits = total;

    if (hits.length === 0) {
      iziToast.info({
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      hideLoadMoreButton();
      return;
    }

    createGallery(hits); 

    if (totalHits > currentPage * perPage) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({ message: 'Something went wrong. Please try again later.' });
    hideLoadMoreButton();
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    const { hits } = data;

    if (hits.length === 0) {
      hideLoadMoreButton();
      return;
    }

    createGallery(hits); 

    scrollPage();

    if (currentPage * perPage >= totalHits) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
      hideLoadMoreButton();
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({ message: 'Failed to load more images.' });
    hideLoadMoreButton();
  } finally {
    hideLoader();
  }
});
