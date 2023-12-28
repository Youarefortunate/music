import * as ResourceEnum from '@/enums/ResourceEnum'
/**
 * 给资源点赞参数类型
*/
export interface LikeTheResourceParams {
  id: string | number;
  t: ResourceEnum.LikeTheResourceEnum;
  type: ResourceEnum.ResourceTypeEnum;
  /** 动态点赞会用到 */ 
  threadId?: string | number;
}