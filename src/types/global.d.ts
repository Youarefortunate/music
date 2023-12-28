declare global {
  /**
   * 分页查询参数
   */
  interface PageQuery {
    // 页码
    pageNum: number,
    // 一页显示的条数
    pageSize: number,
  }

  // 表格table头部字段类型
  interface TableColumnData {
    label: string,
    prop?: string,
    text?: string,
    width?: number | string | undefined,
    minWidth?: number | string,
  }

  // 全局分页参数
  interface PageQueryParams {
    limit?: string | number,
    offset?: string | number,
    before?: number,
  }
}


export { };
