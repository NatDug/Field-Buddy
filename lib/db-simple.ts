// Simple web-compatible database using AsyncStorage
// This avoids the expo-sqlite WASM issues on web

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface SimpleDatabase {
  executeSql: (sql: string, params?: any[]) => Promise<{ rows: { _array: any[] }, insertId?: number }>;
  transaction: (callback: (tx: SimpleTransaction) => void) => Promise<void>;
}

export interface SimpleTransaction {
  executeSql: (sql: string, params?: any[], success?: () => void, error?: (error: any) => boolean) => void;
}

class AsyncStorageDatabase implements SimpleDatabase {
  private storageKey = 'agriden_web_data';

  async executeSql(sql: string, params: any[] = []): Promise<{ rows: { _array: any[] }, insertId?: number }> {
    const lowerSql = sql.toLowerCase().trim();
    
    if (lowerSql.startsWith('create table')) {
      // Tables are created automatically, just return success
      return { rows: { _array: [] } };
    } else if (lowerSql.startsWith('select')) {
      return this.handleSelect(sql, params);
    } else if (lowerSql.startsWith('insert')) {
      return this.handleInsert(sql, params);
    } else if (lowerSql.startsWith('update')) {
      return this.handleUpdate(sql, params);
    } else if (lowerSql.startsWith('delete')) {
      return this.handleDelete(sql, params);
    }

    throw new Error(`Unsupported SQL operation: ${sql}`);
  }

  private async handleSelect(sql: string, params: any[]): Promise<{ rows: { _array: any[] } }> {
    const tableName = this.extractTableName(sql, 'from');
    if (!tableName) {
      throw new Error('Could not parse table name from SELECT statement');
    }

    const data = await this.getTableData(tableName);
    
    // Simple WHERE clause handling
    if (sql.toLowerCase().includes('where')) {
      const filteredData = this.applyWhereClause(data, sql, params);
      return { rows: { _array: filteredData } };
    }

    return { rows: { _array: data } };
  }

  private async handleInsert(sql: string, params: any[]): Promise<{ rows: { _array: any[] }, insertId: number }> {
    const tableName = this.extractTableName(sql, 'into');
    if (!tableName) {
      throw new Error('Could not parse table name from INSERT statement');
    }

    const newRecord = this.createRecordFromInsert(sql, params);
    const data = await this.getTableData(tableName);
    
    // Generate new ID
    const newId = data.length > 0 ? Math.max(...data.map((item: any) => item.id || 0)) + 1 : 1;
    newRecord.id = newId;
    
    data.push(newRecord);
    await this.setTableData(tableName, data);
    
    return { rows: { _array: [] }, insertId: newId };
  }

  private async handleUpdate(sql: string, params: any[]): Promise<{ rows: { _array: any[] } }> {
    const tableName = this.extractTableName(sql, 'update');
    if (!tableName) {
      throw new Error('Could not parse table name from UPDATE statement');
    }

    const data = await this.getTableData(tableName);
    
    // Simple UPDATE implementation
    if (sql.toLowerCase().includes('where id = ?')) {
      const idIndex = sql.toLowerCase().indexOf('where id = ?');
      const idParamIndex = this.countQuestionMarks(sql.substring(0, idIndex));
      const id = params[idParamIndex];
      
      const recordIndex = data.findIndex((item: any) => item.id === id);
      if (recordIndex !== -1) {
        // Update the record with new values
        const updateFields = this.extractUpdateFields(sql);
        updateFields.forEach((field, index) => {
          if (params[index] !== undefined) {
            data[recordIndex][field] = params[index];
          }
        });
        
        await this.setTableData(tableName, data);
      }
    }

    return { rows: { _array: [] } };
  }

  private async handleDelete(sql: string, params: any[]): Promise<{ rows: { _array: any[] } }> {
    const tableName = this.extractTableName(sql, 'from');
    if (!tableName) {
      throw new Error('Could not parse table name from DELETE statement');
    }

    const data = await this.getTableData(tableName);
    
    if (sql.toLowerCase().includes('where id = ?')) {
      const idIndex = sql.toLowerCase().indexOf('where id = ?');
      const idParamIndex = this.countQuestionMarks(sql.substring(0, idIndex));
      const id = params[idParamIndex];
      
      const filteredData = data.filter((item: any) => item.id !== id);
      await this.setTableData(tableName, filteredData);
    }

    return { rows: { _array: [] } };
  }

  private extractTableName(sql: string, keyword: string): string | null {
    const regex = new RegExp(`${keyword}\\s+(\\w+)`, 'i');
    const match = sql.match(regex);
    return match ? match[1] : null;
  }

  private extractUpdateFields(sql: string): string[] {
    const setMatch = sql.match(/set\s+(.+?)\s+where/i);
    if (!setMatch) return [];
    
    const fields = setMatch[1].split(',').map(field => {
      const fieldMatch = field.match(/(\w+)\s*=/);
      return fieldMatch ? fieldMatch[1].trim() : '';
    }).filter(field => field);
    
    return fields;
  }

  private applyWhereClause(data: any[], sql: string, params: any[]): any[] {
    if (sql.toLowerCase().includes('where id = ?')) {
      const idIndex = sql.toLowerCase().indexOf('where id = ?');
      const idParamIndex = this.countQuestionMarks(sql.substring(0, idIndex));
      const id = params[idParamIndex];
      return data.filter((item: any) => item.id === id);
    }
    return data;
  }

  private countQuestionMarks(str: string): number {
    return (str.match(/\?/g) || []).length;
  }

  private createRecordFromInsert(sql: string, params: any[]): any {
    const record: any = {};
    
    // Extract column names from INSERT statement
    const columnsMatch = sql.match(/insert\s+into\s+\w+\s*\(([^)]+)\)/i);
    if (columnsMatch) {
      const columns = columnsMatch[1].split(',').map(col => col.trim());
      columns.forEach((column, index) => {
        if (params[index] !== undefined) {
          record[column] = params[index];
        }
      });
    }
    
    return record;
  }

  private async getTableData(tableName: string): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.storageKey}_${tableName}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting table data for ${tableName}:`, error);
      return [];
    }
  }

  private async setTableData(tableName: string, data: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.storageKey}_${tableName}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting table data for ${tableName}:`, error);
    }
  }

  async transaction(callback: (tx: SimpleTransaction) => void): Promise<void> {
    const tx: SimpleTransaction = {
      executeSql: (sql: string, params?: any[], success?: () => void, error?: (error: any) => boolean) => {
        this.executeSql(sql, params || [])
          .then(() => {
            if (success) success();
          })
          .catch((err) => {
            if (error) {
              const shouldContinue = error(err);
              if (!shouldContinue) {
                console.error('Transaction error:', err);
              }
            } else {
              console.error('Transaction error:', err);
            }
          });
      }
    };
    
    try {
      callback(tx);
    } catch (error) {
      console.error('Transaction callback error:', error);
      throw error;
    }
  }
}

// Simple database instance for web
let simpleDatabase: SimpleDatabase | null = null;

export function getSimpleDatabase(): SimpleDatabase {
  if (!simpleDatabase) {
    simpleDatabase = new AsyncStorageDatabase();
  }
  return simpleDatabase;
}

export function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}
