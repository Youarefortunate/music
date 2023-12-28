import * as SearchMusicEnum from '@/enums/SearchMusicEnum'
/**
 * 搜索建议参数
 */
export interface SearchSuggestParams {
  keywords: string;
  type?: string;
}

/**
 * 搜素音乐参数
*/
export interface SearchMusicParams extends PageQueryParams {
  keywords: string;
  type?: SearchMusicEnum.SearchMusicType;
}