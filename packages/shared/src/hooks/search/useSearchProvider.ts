import { useRouter } from 'next/router';
import { useCallback } from 'react';
import {
  SEARCH_POST_SUGGESTIONS,
  SEARCH_TAG_SUGGESTIONS,
  SearchProviderEnum,
  SearchSuggestionResult,
  defaultSearchSuggestionsLimit,
  getSearchUrl,
} from '../../graphql/search';
import { useRequestProtocol } from '../useRequestProtocol';
import { graphqlUrl } from '../../lib/config';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

export type UseSearchProviderProps = {
  provider: SearchProviderEnum;
  query: string;
  limit?: number;
};

export type UseSearchProvider = {
  search: (props: UseSearchProviderProps) => void;
  getSuggestions: (
    props: UseSearchProviderProps,
  ) => Promise<SearchSuggestionResult>;
};

const searchProviderSuggestionsQueryMap: Partial<
  Record<SearchProviderEnum, string>
> = {
  [SearchProviderEnum.Posts]: SEARCH_POST_SUGGESTIONS,
  [SearchProviderEnum.Tags]: SEARCH_TAG_SUGGESTIONS,
};

const searchProviderExtractResultMap: Partial<
  Record<
    keyof typeof searchProviderSuggestionsQueryMap,
    (data: { [key: string]: SearchSuggestionResult }) => SearchSuggestionResult
  >
> = {
  [SearchProviderEnum.Posts]: (data) => data.searchPostSuggestions,
  [SearchProviderEnum.Tags]: (data) => data.searchTagSuggestions,
};

export const useSearchProvider = (): UseSearchProvider => {
  const router = useRouter();
  const { requestMethod } = useRequestProtocol();
  const searchVersion = useFeature(feature.searchVersion);

  return {
    search: useCallback(
      ({ provider, query }) => {
        router.push(getSearchUrl({ query, provider }));
      },
      [router],
    ),
    getSuggestions: useCallback(
      async ({ provider, query, limit = defaultSearchSuggestionsLimit }) => {
        const graphqlQuery = searchProviderSuggestionsQueryMap[provider];
        const resultExtractor = searchProviderExtractResultMap[provider];

        if (!graphqlQuery || !resultExtractor) {
          return {
            hits: [],
          };
        }

        const result = await requestMethod(graphqlUrl, graphqlQuery, {
          query,
          version: searchVersion,
          limit,
        });

        return resultExtractor(result);
      },
      [requestMethod, searchVersion],
    ),
  };
};
