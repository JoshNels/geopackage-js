import { SpatialReferenceSystem } from './spatialReferenceSystem';
import { DBValue } from '../db/dbAdapter';
import { ColumnValues } from '../dao/columnValues';
import { Projection, ProjectionConstants } from '@ngageoint/projections-js';
import { GeoPackageDao } from '../db/geoPackageDao';
import { ContentsDao } from '../contents/contentsDao';
import { GeometryColumnsDao } from '../features/columns/geometryColumnsDao';
import { TileMatrixSetDao } from '../tiles/matrixset/tileMatrixSetDao';
import { Contents } from '../contents/contents';
import { GeometryColumns } from '../features/columns/geometryColumns';
import { TileMatrixSet } from '../tiles/matrixset/tileMatrixSet';
import { GeoPackageConnection } from '../db/geoPackageConnection';
import { SpatialReferenceSystemConstants } from './spatialReferenceSystemConstants';
import { CrsWktExtension } from '../extension/crsWktExtension';

/**
 * Spatial Reference System Data Access Object
 * @extends Dao
 * @class SpatialReferenceSystemDao
 * @param {module:geoPackage~GeoPackage} geoPackage The GeoPackage object
 */
export class SpatialReferenceSystemDao extends GeoPackageDao<SpatialReferenceSystem, number> {
  readonly idColumns: string[] = [SpatialReferenceSystem.COLUMN_SRS_ID];
  /**
   * Table Name
   * @type {String}
   */
  readonly gpkgTableName: string = SpatialReferenceSystem.TABLE_NAME;

  /**
   * Contents DAO
   */
  private contentsDao: ContentsDao;

  /**
   * Geometry Columns DAO
   */
  private geometryColumnsDao: GeometryColumnsDao;

  /**
   * Tile Matrix Set DAO
   */
  private tileMatrixSetDao: TileMatrixSetDao;

  /**
   * CRS WKT Extension
   */
  private crsWktExtension: CrsWktExtension;

  /**
   *
   * @param geoPackage GeoPackage object this dao belongs to
   */
  constructor(readonly geoPackageConnection: GeoPackageConnection) {
    super(geoPackageConnection, SpatialReferenceSystem.TABLE_NAME);
    this.geometryColumnsDao = GeometryColumnsDao.createDao(geoPackageConnection);
    this.tileMatrixSetDao = TileMatrixSetDao.createDao(geoPackageConnection);
    this.contentsDao = ContentsDao.createDao(geoPackageConnection);
  }

  public static createDao(geoPackageConnection: GeoPackageConnection): SpatialReferenceSystemDao {
    return new SpatialReferenceSystemDao(geoPackageConnection);
  }

  queryForIdWithKey(key: number): SpatialReferenceSystem {
    return this.queryForId(key);
  }

  /**
   * Create a new SpatialReferenceSystem object
   * @return {module:core/srs~SpatialReferenceSystem}
   */
  createObject(results?: Record<string, DBValue>): SpatialReferenceSystem {
    const srs = new SpatialReferenceSystem();
    if (results) {
      srs.srs_name = results.srs_name as string;
      srs.srs_id = results.srs_id as number;
      srs.organization = results.organization as string;
      srs.organization_coordsys_id = results.organization_coordsys_id as number;
      srs.definition = results.definition as string;
      srs.definition_12_063 = results.definition as string;
      srs.description = results.description as string;
      this.getAndSetContents(srs);
      this.getAndSetGeometryColumns(srs);
      this.getAndSetTileMatrixSet(srs);
    }
    return srs;
  }

  /**
   * Set the CRS WKT Extension
   * @param crsWktExtension CRS WKT Extension
   */
  public setCrsWktExtension(crsWktExtension: CrsWktExtension): void {
    this.crsWktExtension = crsWktExtension;
  }

  /**
   * Creates the required EPSG WGS84 Spatial Reference System (spec
   * Requirement 11)
   * @return {Number} id of the created row
   */
  createWgs84(): number {
    let srs = this.getBySrsId(ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM);
    if (srs) {
      return srs.srs_id;
    }
    srs = new SpatialReferenceSystem();
    srs.srs_name = 'WGS 84 geodetic';
    srs.srs_id = ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM;
    srs.organization = ProjectionConstants.AUTHORITY_EPSG;
    srs.organization_coordsys_id = ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM;
    srs.definition =
      'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';
    srs.description = 'longitude/latitude coordinates in decimal degrees on the WGS 84 spheroid';
    if (this.db.columnExists('gpkg_spatial_ref_sys', 'definition_12_063')) {
      srs.definition_12_063 = SpatialReferenceSystemConstants.WORLD_GEODETIC_DEFINITION_12_063;
    }
    return this.create(srs);
  }
  /**
   * Creates the required Undefined Cartesian Spatial Reference System (spec
   * Requirement 11)
   * @return {Number} id of the created row
   */
  createUndefinedCartesian(): number {
    let srs = this.getBySrsId(-1);
    if (srs) {
      return srs.srs_id;
    }
    srs = new SpatialReferenceSystem();
    srs.srs_name = 'Undefined cartesian SRS';
    srs.srs_id = -1;
    srs.organization = ProjectionConstants.AUTHORITY_NONE;
    srs.organization_coordsys_id = ProjectionConstants.UNDEFINED_CARTESIAN;
    srs.definition = 'undefined';
    srs.description = 'undefined cartesian coordinate reference system';
    if (this.db.columnExists('gpkg_spatial_ref_sys', 'definition_12_063')) {
      srs.definition_12_063 = SpatialReferenceSystemConstants.UNDEFINED_CARTESIAN_DEFINITION_12_063;
    }
    return this.create(srs);
  }
  /**
   * Creates the required Undefined Geographic Spatial Reference System (spec
   * Requirement 11)
   * @return {Number} id of the created row
   */
  createUndefinedGeographic(): number {
    let srs = this.getBySrsId(0);
    if (srs) {
      return srs.srs_id;
    }
    srs = new SpatialReferenceSystem();
    srs.srs_name = 'Undefined geographic SRS';
    srs.srs_id = 0;
    srs.organization = ProjectionConstants.AUTHORITY_NONE;
    srs.organization_coordsys_id = ProjectionConstants.UNDEFINED_GEOGRAPHIC;
    srs.definition = 'undefined';
    srs.description = 'undefined geographic coordinate reference system';
    if (this.db.columnExists('gpkg_spatial_ref_sys', 'definition_12_063')) {
      srs.definition_12_063 = SpatialReferenceSystemConstants.UNDEFINED_GEOGRAPHIC_DEFINITION_12_063;
    }
    return this.create(srs);
  }
  /**
   * Creates the Web Mercator Spatial Reference System if it does not already
   * exist
   * @return {Number} id of the created row
   */
  createWebMercator(): number {
    let srs = this.getByOrganizationAndCoordSysId(
      ProjectionConstants.AUTHORITY_EPSG,
      ProjectionConstants.EPSG_WEB_MERCATOR,
    );
    if (srs) {
      return srs.srs_id;
    }
    srs = new SpatialReferenceSystem();
    srs.srs_name = 'WGS 84 / Pseudo-Mercator';
    srs.srs_id = ProjectionConstants.EPSG_WEB_MERCATOR;
    srs.organization = ProjectionConstants.AUTHORITY_EPSG;
    srs.organization_coordsys_id = ProjectionConstants.EPSG_WEB_MERCATOR;
    srs.definition =
      'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"],AUTHORITY["EPSG","3857"]]';
    srs.description = 'Spherical Mercator projection coordinate system';
    if (this.db.columnExists('gpkg_spatial_ref_sys', 'definition_12_063')) {
      srs.definition_12_063 = SpatialReferenceSystemConstants.WEB_MERCATOR_DEFINITION_12_063;
    }
    return this.create(srs);
  }

  /**
   * Creates the required EPSG WGS84 Geographical 3D Spatial Reference System
   *
   * @return spatial reference system
   * @throws SQLException upon creation failure
   */
  public createWgs84Geographical3D(): number {
    const srs = new SpatialReferenceSystem();
    srs.srs_name = 'WGS 84 Geographic 3D';
    srs.srs_id = 4979;
    srs.organization = 'EPSG';
    srs.organization_coordsys_id = 4979;
    srs.definition =
      'GEOGCS["WGS 84",DATUM["World Geodetic System 1984",SPHEROID["WGS 84",6378137.0,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.017453292519943295],AXIS["Geodetic latitude",NORTH],AXIS["Geodetic longitude",EAST],AXIS["Ellipsoidal height",UP],AUTHORITY["EPSG","4979"]]';
    srs.description = 'Used by the GPS satellite navigation system.';
    if (this.db.columnExists('gpkg_spatial_ref_sys', 'definition_12_063')) {
      srs.definition_12_063 = SpatialReferenceSystemConstants.WGS84_3D_DEFINITION_12_063;
    }
    return this.create(srs);
  }

  getAllSpatialReferenceSystems(): SpatialReferenceSystem[] {
    const spatialRefSystems: SpatialReferenceSystem[] = [];
    if (this.db != null && this.isTableExists()) {
      const results: Record<string, DBValue>[] = this.queryForAll();
      if (results && results.length) {
        for (let i = 0; i < results.length; i++) {
          spatialRefSystems.push(this.createObject(results[i]));
        }
      }
    }
    return spatialRefSystems;
  }

  getByOrganizationAndCoordSysId(organization: string, organizationCoordSysId: number): SpatialReferenceSystem {
    const cv = new ColumnValues();
    cv.addColumn('organization', organization);
    cv.addColumn('organization_coordsys_id', organizationCoordSysId);
    const results: Record<string, DBValue>[] = this.queryForAll(this.buildWhere(cv), this.buildWhereArgs(cv));
    if (results && results.length) {
      return this.createObject(results[0]);
    }
  }
  /**
   * Get the Spatial Reference System for the provided id
   * @param  {Number}   srsId srs id
   * @return {module:core/srs~SpatialReferenceSystem}
   */
  getBySrsId(srsId: number): SpatialReferenceSystem {
    return this.queryForId(srsId);
  }
  /**
   * Return the proj4 projection specified by this SpatialReferenceSystem
   * @return {typeof proj4}
   */
  getProjection(srs: SpatialReferenceSystem): Projection {
    return srs.projection;
  }

  /**
   * Get or create a Contents DAO
   *
   * @return contents dao
   */
  private getContentsDao(): ContentsDao {
    if (this.contentsDao == null) {
      this.contentsDao = ContentsDao.createDao(this.db);
    }
    return this.contentsDao;
  }

  /**
   * Get or create a Geometry Columns DAO
   *
   * @return geometry columns dao
   */
  private getGeometryColumnsDao(): GeometryColumnsDao {
    if (this.geometryColumnsDao == null) {
      this.geometryColumnsDao = GeometryColumnsDao.createDao(this.db);
    }
    return this.geometryColumnsDao;
  }

  /**
   * Get or create a Tile Matrix Set DAO
   *
   * @return tile matrix set dao
   */
  private getTileMatrixSetDao(): TileMatrixSetDao {
    if (this.tileMatrixSetDao == null) {
      this.tileMatrixSetDao = TileMatrixSetDao.createDao(this.db);
    }
    return this.tileMatrixSetDao;
  }

  /**
   * Get the Contents for the SpatialReferenceSystem
   * @param  {module:core/spatialReferenceSystem~SpatialReferenceSystem} spatialReferenceSystem SpatialReferenceSystem
   * @return {module:features/columns~GeometryColumns}
   */
  private getAndSetContents(spatialReferenceSystem: SpatialReferenceSystem): Contents[] {
    const dao: ContentsDao = this.getContentsDao();
    const results = dao.queryForAllEq(Contents.COLUMN_SRS_ID, spatialReferenceSystem.getSrsId());
    const contents = [];
    if (results?.length) {
      for (let i = 0; i < results.length; i++) {
        contents.push(dao.createObject(results[i]));
      }
      spatialReferenceSystem.setContents(contents);
    }
    return contents;
  }

  /**
   * Get the GeometryColumns for the SpatialReferenceSystem
   * @param  {module:core/spatialReferenceSystem~SpatialReferenceSystem} spatialReferenceSystem SpatialReferenceSystem   * @return {module:features/columns~GeometryColumns}
   */
  private getAndSetGeometryColumns(spatialReferenceSystem: SpatialReferenceSystem): GeometryColumns[] {
    const dao: GeometryColumnsDao = this.getGeometryColumnsDao();
    const results = dao.queryForAllEq(GeometryColumns.COLUMN_SRS_ID, spatialReferenceSystem.getSrsId());
    const geometryColumns = [];
    if (results?.length) {
      for (let i = 0; i < results.length; i++) {
        geometryColumns.push(dao.createObject(results[i]));
      }
      spatialReferenceSystem.setGeometryColumns(geometryColumns);
    }
    return geometryColumns;
  }

  /**
   * Get the TileMatrixSet for the SpatialReferenceSystem
   * @param  {module:core/spatialReferenceSystem~SpatialReferenceSystem} spatialReferenceSystem SpatialReferenceSystem   * @return {module:tiles/matrixset~TileMatrixSet}
   */
  private getAndSetTileMatrixSet(spatialReferenceSystem: SpatialReferenceSystem): TileMatrixSet[] {
    const dao = this.getTileMatrixSetDao();
    const results = dao.queryForAllEq(TileMatrixSetDao.COLUMN_SRS_ID, spatialReferenceSystem.getSrsId());
    const tileMatrixSet = [];
    if (results?.length) {
      for (let i = 0; i < results.length; i++) {
        tileMatrixSet.push(dao.createObject(results[i]));
      }
      spatialReferenceSystem.setContents(tileMatrixSet);
    }
    return tileMatrixSet;
  }

  /**
   * Delete the Spatial Reference System, cascading
   * @param srs spatial reference system
   * @return deleted count
   */
  public deleteCascade(srs: SpatialReferenceSystem): number {
    let count = 0;

    if (srs != null) {
      // Delete Contents
      const contentsCollection = srs.getContents();
      if (contentsCollection.length !== 0) {
        const dao = this.getContentsDao();
        for (const contents of contentsCollection) {
          dao.deleteCascade(contents);
        }
      }

      // Delete Geometry Columns
      const geometryColumnsDao = this.getGeometryColumnsDao();
      if (geometryColumnsDao.isTableExists()) {
        const geometryColumnsCollection = srs.getGeometryColumns();
        if (geometryColumnsCollection.length !== 0) {
          for (const geometryColumns of geometryColumnsCollection) {
            geometryColumnsDao.delete(geometryColumns);
          }
        }
      }

      // Delete Tile Matrix Set
      const tileMatrixSetDao = this.getTileMatrixSetDao();
      if (tileMatrixSetDao.isTableExists()) {
        const tileMatrixSetCollection = srs.getTileMatrixSet();
        if (tileMatrixSetCollection.length !== 0) {
          for (const tileMatrixSet of tileMatrixSetCollection) {
            tileMatrixSetDao.delete(tileMatrixSet);
          }
        }
      }

      // Delete
      count = this.delete(srs);
    }
    return count;
  }
}