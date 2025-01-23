import { DatabaseError } from '../features/workspace/errors'

export type OrderDirection = 'ASC' | 'DESC'
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
export type SQLValue = string | number | boolean | null | Date
export type SQLParam = SQLValue | SQLValue[]

export interface QueryCondition {
  sql: string
  params: SQLParam[]
}

export interface OrderByClause {
  field: string
  direction: OrderDirection
}

export interface JoinClause {
  type: JoinType
  table: string
  condition: string
  params: SQLParam[]
}

/**
 * SQL Query Builder for constructing type-safe database queries
 */
export class QueryBuilder {
  private selectClause: string[] = []
  private fromTable: string = ''
  private whereConditions: QueryCondition[] = []
  private joinClauses: JoinClause[] = []
  private groupByFields: string[] = []
  private havingConditions: QueryCondition[] = []
  private orderByClauses: OrderByClause[] = []
  private limitValue?: number
  private offsetValue?: number
  private params: SQLParam[] = []

  /**
   * Specify fields to select
   */
  select(fields: string | string[]): this {
    this.selectClause = Array.isArray(fields) ? fields : [fields]
    return this
  }

  /**
   * Specify the table to query from
   */
  from(table: string): this {
    this.fromTable = table
    return this
  }

  /**
   * Add a WHERE condition
   */
  where(condition: string, ...params: SQLParam[]): this {
    this.whereConditions.push({ sql: condition, params })
    return this
  }

  /**
   * Add a WHERE IN condition
   */
  whereIn(field: string, values: SQLValue[]): this {
    if (values.length === 0) {
      throw new DatabaseError(
        'Empty values array in WHERE IN clause',
        'query_builder',
        new Error('Values array cannot be empty')
      )
    }
    const placeholders = values.map(() => '?').join(', ')
    return this.where(`${field} IN (${placeholders})`, ...values)
  }

  /**
   * Add a WHERE LIKE condition
   */
  whereLike(field: string, pattern: string): this {
    return this.where(`${field} LIKE ?`, pattern)
  }

  /**
   * Add a WHERE BETWEEN condition
   */
  whereBetween(field: string, start: SQLValue, end: SQLValue): this {
    return this.where(`${field} BETWEEN ? AND ?`, start, end)
  }

  /**
   * Add a JOIN clause
   */
  join(type: JoinType, table: string, condition: string, ...params: SQLParam[]): this {
    this.joinClauses.push({
      type,
      table,
      condition,
      params
    })
    return this
  }

  /**
   * Add an INNER JOIN clause
   */
  innerJoin(table: string, condition: string, ...params: SQLParam[]): this {
    return this.join('INNER', table, condition, ...params)
  }

  /**
   * Add a LEFT JOIN clause
   */
  leftJoin(table: string, condition: string, ...params: SQLParam[]): this {
    return this.join('LEFT', table, condition, ...params)
  }

  /**
   * Add a GROUP BY clause
   */
  groupBy(fields: string | string[]): this {
    this.groupByFields = Array.isArray(fields) ? fields : [fields]
    return this
  }

  /**
   * Add a HAVING condition
   */
  having(condition: string, ...params: SQLParam[]): this {
    this.havingConditions.push({ sql: condition, params })
    return this
  }

  /**
   * Add an ORDER BY clause
   */
  orderBy(field: string, direction: OrderDirection = 'ASC'): this {
    this.orderByClauses.push({ field, direction })
    return this
  }

  /**
   * Set the LIMIT clause
   */
  limit(value: number): this {
    if (value < 0) {
      throw new DatabaseError(
        'Invalid LIMIT value',
        'query_builder',
        new Error('LIMIT value cannot be negative')
      )
    }
    this.limitValue = value
    return this
  }

  /**
   * Set the OFFSET clause
   */
  offset(value: number): this {
    if (value < 0) {
      throw new DatabaseError(
        'Invalid OFFSET value',
        'query_builder',
        new Error('OFFSET value cannot be negative')
      )
    }
    this.offsetValue = value
    return this
  }

  /**
   * Build the final query and parameters
   */
  build(): { query: string; params: SQLParam[] } {
    if (!this.fromTable) {
      throw new DatabaseError(
        'No FROM clause specified',
        'query_builder',
        new Error('FROM clause is required')
      )
    }

    const parts: string[] = []
    this.params = []

    // SELECT
    parts.push(`SELECT ${this.selectClause.length > 0 ? this.selectClause.join(', ') : '*'}`)

    // FROM
    parts.push(`FROM ${this.fromTable}`)

    // JOIN
    for (const join of this.joinClauses) {
      parts.push(`${join.type} JOIN ${join.table} ON ${join.condition}`)
      this.params.push(...join.params)
    }

    // WHERE
    if (this.whereConditions.length > 0) {
      const conditions = this.whereConditions.map((c) => c.sql)
      parts.push(`WHERE ${conditions.join(' AND ')}`)
      this.whereConditions.forEach((c) => this.params.push(...c.params))
    }

    // GROUP BY
    if (this.groupByFields.length > 0) {
      parts.push(`GROUP BY ${this.groupByFields.join(', ')}`)
    }

    // HAVING
    if (this.havingConditions.length > 0) {
      const conditions = this.havingConditions.map((c) => c.sql)
      parts.push(`HAVING ${conditions.join(' AND ')}`)
      this.havingConditions.forEach((c) => this.params.push(...c.params))
    }

    // ORDER BY
    if (this.orderByClauses.length > 0) {
      const orderBy = this.orderByClauses.map((c) => `${c.field} ${c.direction}`).join(', ')
      parts.push(`ORDER BY ${orderBy}`)
    }

    // LIMIT & OFFSET
    if (this.limitValue !== undefined) {
      parts.push(`LIMIT ${this.limitValue}`)
    }
    if (this.offsetValue !== undefined) {
      parts.push(`OFFSET ${this.offsetValue}`)
    }

    return {
      query: parts.join(' '),
      params: this.params
    }
  }

  /**
   * Reset the query builder state
   */
  reset(): this {
    this.selectClause = []
    this.fromTable = ''
    this.whereConditions = []
    this.joinClauses = []
    this.groupByFields = []
    this.havingConditions = []
    this.orderByClauses = []
    this.limitValue = undefined
    this.offsetValue = undefined
    this.params = []
    return this
  }
}
