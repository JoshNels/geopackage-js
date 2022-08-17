import { Dao } from '../../../dao/dao';
import { TileScaling } from './tileScaling';
import { DBValue } from '../../../db/dbAdapter';
import { GeoPackageDao } from '../../../db/geoPackageDao';
import { GeoPackageConnection } from '../../../db/geoPackageConnection';

/**
 * Tile Scaling Data Access Object
 * @constructor
 * @extends Dao
 */
export class TileScalingDao extends GeoPackageDao<TileScaling, string> {
  readonly gpkgTableName: string = TileScaling.TABLE_NAME;
  readonly idColumns: string[] = [TileScaling.COLUMN_TABLE_NAME];

  /**
   * Constructor
   * @param geoPackageConnection GeoPackage object this dao belongs to
   */
  constructor(geoPackageConnection: GeoPackageConnection) {
    super(geoPackageConnection, TileScaling.TABLE_NAME);
  }

  public static createDao(geoPackageConnection: GeoPackageConnection): TileScalingDao {
    return new TileScalingDao(geoPackageConnection);
  }

  /**
   * Create a {module:extension/nga/scale.TileScaling} object
   * @return {module:extension/nga/scale.TileScaling}
   */
  createObject(results?: Record<string, DBValue>): TileScaling {
    const c = new TileScaling();
    if (results) {
      c.setTableName(results.table_name as string);
      c.setScalingTypeWithString(results.scaling_type as string);
      c.setZoomIn(results.zoom_in as number);
      c.setZoomOut(results.zoom_out as number);
    }
    return c;
  }

  /**
   * Query by table name
   * @param  {string} tableName name of the table
   * @return {module:extension/nga/scale.TileScaling}
   */
  queryForTableName(tableName: string): TileScaling {
    const tileScaling = this.queryForAll(
      this.buildWhereWithFieldAndValue(TileScaling.COLUMN_TABLE_NAME, tableName),
      this.buildWhereArgs(tableName),
    );
    if (tileScaling.length > 0) {
      return this.createObject(tileScaling[0]);
    } else {
      return null;
    }
  }
  /**
   * Delete by tableName
   * @param  {string} tableName the table name to delete by
   * @return {number} number of deleted rows
   */
  deleteByTableName(tableName: string): number {
    return this.deleteWhere(
      this.buildWhereWithFieldAndValue(TileScaling.COLUMN_TABLE_NAME, tableName),
      this.buildWhereArgs(tableName),
    );
  }

  queryForIdWithKey(key: string): TileScaling {
    return this.queryForId(key);
  }
}