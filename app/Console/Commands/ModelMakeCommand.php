<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Models\BaseModel;
use Doctrine\DBAL\Schema\Column;
use Doctrine\DBAL\Types\BigIntType;
use Doctrine\DBAL\Types\BooleanType;
use Doctrine\DBAL\Types\DateTimeType;
use Doctrine\DBAL\Types\DateType;
use Doctrine\DBAL\Types\DecimalType;
use Doctrine\DBAL\Types\FloatType;
use Doctrine\DBAL\Types\IntegerType;
use Doctrine\DBAL\Types\SmallIntType;
use Illuminate\Console\GeneratorCommand;
use Illuminate\Database\Connection;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;

/**
 * Class ModelMakeCommand
 * @package EnneSystems\GraphQL\Console
 */
class ModelMakeCommand extends GeneratorCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gen:model {name} {--echo}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new BaseModel class';

    /**
     * The type of class being generated.
     *
     * @var string
     */
    protected $type = 'Model';


    /** @var Connection */
    protected $connection;


    /** @var string */
    protected $modelName;


    /** @var array */
    protected $jsonCols = [
        'config',
        'options',
        'settings',
    ];

    /** @var array */
    protected $timestampCols = [
        BaseModel::COL_CREATED_AT,
        BaseModel::COL_UPDATED_AT,
    ];

    /** @var array */
    protected $notFillable = [
        BaseModel::COL_ID,
        BaseModel::COL_CREATED_AT,
        BaseModel::COL_UPDATED_AT,
        BaseModel::COL_DELETED_AT,
    ];

    /** @var string */
    protected $softDeleteCol = BaseModel::COL_DELETED_AT;

    protected $idForeignColumnSuffix = '_id';

    private $tables;

    /**
     * ModelMakeCommand constructor.
     * @param Filesystem $files
     * @param Connection $connection
     */
    public function __construct(Filesystem $files, Connection $connection)
    {
        parent::__construct($files);
        $this->connection = $connection;
    }

    /**
     * @return bool|null
     */
    public function handle()
    {
        if ($this->option('echo')) {
            $name = $this->qualifyClass($this->getNameInput());

            try {
                $cls = $this->buildClass($name);

                echo $cls;
            }
            catch (\Exception $e) {
                $this->error($e->getMessage());
            }

            return null;
        }
        else {
            return parent::handle();
        }
    }


    /**
     * Get the stub file for the generator.
     *
     * @return string
     */
    protected function getStub()
    {
        return __DIR__ . '/../stubs/model.stub';
    }

    /**
     * Get the default namespace for the class.
     *
     * @param  string $rootNamespace
     * @return string
     */
    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\Models';
    }

    /**
     * Build the class with the given name.
     *
     * @param  string $name
     * @return string
     * @throws \Exception
     */
    protected function buildClass($name)
    {
        $stub = parent::buildClass($name);

        $stub = $this->prepareStub($stub);

        return $stub;
    }

    /**
     * @param string $stub
     * @return mixed
     * @throws \Exception
     */
    protected function prepareStub($stub)
    {
        $this->modelName = (string)$this->argument('name');

        $table = Str::plural(Str::snake($this->modelName));

        $columns = $this->getColumns($table);

        $columnTypes = $this->getColumnTypes($columns, $table);

        $stub = $this->fillTraits($stub, $table, $columnTypes);

        $stub = $this->fillTable($stub, $table);

        $stub = $this->fillCols($stub, $columns);

        $stub = $this->fillTimestamps($stub, $columns);

        $stub = $this->fillFillables($stub, $columns);

        $stub = $this->fillFields($stub, $columns);

        $stub = $this->fillCasts($stub, $columnTypes);

        $stub = $this->fillRelations($stub, $table, $columns, $columnTypes);

        return $stub;
    }

    /**
     * @param mixed $columns
     * @param string $table
     * @return Column[]
     */
    protected function getColumnTypes($columns, $table)
    {
        $doctrineCols = [];
        foreach ($columns as $column) {
            $doctrineCols[$column] = $this->connection->getDoctrineColumn($table, $column);
        }

        return $doctrineCols;
    }


    /**
     * @param string $stub
     * @param string $table
     * @param Column[] $columnTypes
     * @return mixed
     */
    protected function fillTraits($stub, $table, $columnTypes)
    {
        $replacement = '';
        if (isset($columnTypes[$this->softDeleteCol])) {
            /** @var Column $col */
            $col = $columnTypes[$this->softDeleteCol];
            if ($col->getType() instanceof DateType) {
                $replacement = '    use Illuminate\Database\Eloquent\SoftDeletes;';

            }
        }

        $stub = Str::replacePlaceholder($stub, 'TRAITS', $replacement);

        return $stub;
    }

    /**
     * @param string $stub
     * @param mixed $columns
     * @return string
     */
    protected function fillCols($stub, $columns)
    {
        $cols = "const ";
        $tcols = "\tconst ";

        $i = 0;
        foreach ($columns as $columnName) {
            $upper = Str::upper($columnName);
            $cols .= ($i ? "\t\t  " : "") . "COL_$upper = '$columnName',\n";
            $tcols .= ($i ? "\t\t  " : "") . "TCOL_$upper = self::TABLE . '.' . self::COL_$upper,\n";
            $i++;
        }

        $replacement = Str::substr($cols, 0, -2) . ";\n\n"
            . Str::substr($tcols, 0, -2) . ";\n";

        return Str::replacePlaceholder($stub, 'COLS', $replacement);
    }


    /**
     * @param string $stub
     * @param string $table
     * @return string
     */
    protected function fillTable($stub, $table)
    {
        return Str::replacePlaceholder($stub, 'TABLE', "const TABLE = '$table';");
    }

    /**
     * @param string $stub
     * @param string[] $columns
     * @return string
     */
    protected function fillTimestamps($stub, $columns)
    {
        $hasCount = 0;

        foreach ($columns as $column) {
            if (Arr::has($this->timestampCols, $column)) {
                $hasCount++;
            }
        }

        if ($hasCount == count($this->timestampCols)) {
            $replacement = "    public \$timestamps = true;";
        } else {
            $replacement = "";
        }

        return Str::replacePlaceholder($stub, 'TIMESTAMPS', $replacement);
    }

    /**
     * @param string $stub
     * @param string[] $columns
     * @return string
     */
    protected function fillFillables($stub, $columns)
    {
        $replacement = "protected \$fillable = [\n";
        foreach ($columns as $column) {
            if (!in_array($column, $this->notFillable)) {
                $col = "COL_" . Str::upper($column);
                $replacement .= "\t\tself::$col,\n";
            }
        }

        return Str::replacePlaceholder($stub, 'FILLABLES', $replacement . "\t];");
    }

    /**
     * @param string $stub
     * @param string[] $columns
     * @return string
     */
    protected function fillFields($stub, $columns)
    {
        $replacement = "protected \$fields = [\n";
        foreach ($columns as $column) {
            $col = "COL_" . Str::upper($column);
            $replacement .= "\t\tself::$col,\n";
        }

        return Str::replacePlaceholder($stub, 'FIELDS', $replacement . "\t];");
    }


    /**
     * @param string $stub
     * @param Column[] $columns
     * @return string
     */
    protected function fillCasts($stub, $columns)
    {
        $replacement = "protected \$casts = [\n";
        foreach ($columns as $column) {
            $name = $column->getName();
            if (!in_array($name, $this->notFillable) && !$this->isRelationColumn($name)) {
                $col = "COL_" . Str::upper($name);
                if (Arr::has($this->jsonCols, $name)) {
                    $replacement .= "\t\tself::$col => self::CAST_ARRAY,\n";
                } else {
                    $type = $column->getType();
                    if ($type instanceof DateType || $type instanceof DateTimeType) {
                        $replacement .= "\t\tself::$col => self::CAST_DATE,\n";
                    } else {
                        if ($type instanceof BooleanType || $type instanceof SmallIntType) {
                            $replacement .= "\t\tself::$col => self::CAST_BOOLEAN,\n";
                        } else {
                            if ($type instanceof IntegerType || $type instanceof BigIntType) {
                                $replacement .= "\t\tself::$col => self::CAST_INTEGER,\n";
                            } else {
                                if ($type instanceof FloatType || $type instanceof DecimalType) {
                                    $replacement .= "\t\tself::$col => self::CAST_FLOAT,\n";
                                } else {
//                                    $replacement .= "\t\tself::$col => self::CAST_STRING,\n";
                                }
                            }
                        }
                    }
                }
            }
        }

        return Str::replacePlaceholder($stub, 'CASTS', $replacement . "\t];");
    }

    /**
     * @param string $stub
     * @param string $table
     * @param mixed $columns
     * @param Column[] $columnTypes
     * @return string
     */
    protected function fillRelations($stub, $table, $columns, $columnTypes)
    {
        $tables = $this->getTablesWithColumns($this->connection);

        $name = Str::snake($this->modelName);
        $foreignKey = $name . $this->idForeignColumnSuffix;

        $relatedTables = [];

        foreach ($tables as $relatedTable => $cols) {
            if (in_array($foreignKey, $cols)) {
                $hasId = in_array('id', $cols);
                $isPlural = Str::plural($relatedTable) === $relatedTable;

                if ($isPlural) { // foreign table points on us
                    $hasBelongsTo = null;
                    if (Str::contains($relatedTable, $name)) {
                        $shortName = $this->getShortName($relatedTable, $name);
                        $singular = Str::singular($shortName);
                        if (in_array($singular . $this->idForeignColumnSuffix, $cols)) {
                            $hasBelongsTo = true;
                            $shortName = $relatedTable;
                        }
                    } else {
                        $shortName = $relatedTable;
                    }

                    $relatedTables[] = [
                        'name'  => Str::plural(Str::camel($shortName)),
                        'type'  => 'hasMany',
                        'model' => $this->getTableModelName($relatedTable),
                        'table' => $relatedTable,
                    ];

                    if ($hasBelongsTo) {
                        $relatedCols = $this->getRelationColumnsWithout($cols, $foreignKey);

                        $relatedTables = array_merge($relatedTables,
                            $this->getBelongsToManyTablesConfigFromColumns($relatedCols, $relatedTable, $name, $hasId));

                    }
                } else {
                    // many to many
                    if ($hasId) { // with special pivot model
                        $relatedTables[] = [
                            'name'  => Str::plural(Str::camel($relatedTable)),
                            'type'  => 'hasMany',
                            'model' => $this->getTableModelName($relatedTable),
                            'table' => $relatedTable,
//                            'pivot' =>
                        ];
                    }

                    $relatedCols = $this->getRelationColumnsWithout($cols, $foreignKey);

                    $relatedTables = array_merge($relatedTables,
                        $this->getBelongsToManyTablesConfigFromColumns($relatedCols, $relatedTable, $name, $hasId));

                }
            }
        }

        $relatedTables = array_merge($relatedTables, $this->getBelongsToTablesConfigFromColumns($columns, $name));

        $relationNames = "";
        $modelRelations = "";
        $relationImplementations = "";
        if (count($relatedTables)) {
            $relationNames = "const ";
            $modelRelations = "public static \$modelRelations = [\n";
            foreach ($relatedTables as $table) {
                $relName = Str::upper(Str::snake($table['name']));
                $relationNames .= "REL_$relName = '${table["name"]}',\n\t\t  ";
                $modelRelations .= "\t\t  self::REL_$relName,\n";
            }

            $relationImplementations = $this->getRelationImplementations($relatedTables);

            $relationNames = Str::substr($relationNames, 0, -6) . ';';
            $modelRelations = $modelRelations . "\t];";
        }

        $stub = Str::replacePlaceholder($stub, 'RELATIONS', $relationNames);
        $stub = Str::replacePlaceholder($stub, 'MODEL_RELATIONS', $modelRelations);
        $stub = Str::replacePlaceholder($stub, 'RELATION_IMPLEMENTATIONS', $relationImplementations);

        return $stub;
    }

    /**
     * @param string $columName
     * @return bool
     */
    protected function isRelationColumn($columName)
    {
        return Str::is("*$this->idForeignColumnSuffix", $columName);
    }

    /**
     * @param string $table
     * @return string
     */
    public static function getTableModelName($table)
    {
        return ucfirst(Str::camel(Str::singular($table)));
    }

    /**
     * @param mixed $cols
     * @param string $foreignKey
     * @return array
     */
    protected function getRelationColumnsWithout($cols, $foreignKey)
    {
        $related = [];
        foreach ($cols as $col) {
            if ($col != $foreignKey && $this->isRelationColumn($col)) {
                $related[] = $col;
            }
        }

        return $related;
    }


    /**
     * @param mixed $columns
     * @param string $type
     * @param string $relatedTable
     * @return array
     */
    protected function getRelatedTablesConfigFromColumns($columns, $type, $relatedTable = null)
    {
        $configs = [];

        foreach ($columns as $column) {
            if ($this->isRelationColumn($column)) {
                if (!$relatedTable) {
                    $relatedTable = Str::plural(Str::substr($column, 0, -Str::length($this->idForeignColumnSuffix)));
                }
                $configs[] = [
                    'name'  => Str::camel(Str::singular($relatedTable)),
                    'type'  => $type,
                    'model' => $this->getTableModelName($relatedTable),
                    'table' => $relatedTable,
                ];
            }
        }

        return $configs;
    }

    /**
     * @param mixed $columns
     * @param string $name
     * @return array
     */
    protected function getBelongsToTablesConfigFromColumns($columns, $name)
    {
        $configs = [];

        foreach ($columns as $column) {
            if ($this->isRelationColumn($column)) {
                $cleanName = Str::substr($column, 0, -Str::length($this->idForeignColumnSuffix));
                $shortName = $this->getShortName($cleanName, $name);
                $relatedTable = Str::plural($cleanName);

                $configs[] = [
                    'name'  => Str::camel($shortName),
                    'type'  => 'belongsTo',
                    'model' => $this->getTableModelName($relatedTable),
                    'table' => $relatedTable,
                ];
            }
        }

        return $configs;
    }

    /**
     * @param mixed $columns
     * @param string $relatedTable
     * @param string $name
     * @param bool $hasId
     * @return array
     */
    protected function getBelongsToManyTablesConfigFromColumns($columns, $relatedTable, $name, $hasId)
    {
        $configs = [];

        foreach ($columns as $column) {
            if ($this->isRelationColumn($column)) {
                $shortName = $this->getShortName($relatedTable, $name);
                $singular = Str::singular($shortName);
                $plural = Str::plural($shortName);
                $configs[] = [
                    'name'  => Str::camel($plural),
                    'type'  => 'belongsToMany',
                    'model' => ucfirst(Str::camel($singular)),
                    'table' => $relatedTable,
                    'pivot' => $hasId ? $this->getTableModelName($relatedTable) : null,
                ];
            }
        }

        return $configs;
    }


    /**
     * @param string[] $relatedTables
     * @return string
     */
    protected function getRelationImplementations($relatedTables)
    {
        $implementations = "";

        foreach ($relatedTables as $relation) {
            switch ($relation['type']) {
                case "belongsTo":
                    $implementations .= $this->getBelongsToImplementation($relation);
                    break;
                case "hasMany":
                    $implementations .= $this->getHasManyImplementation($relation);
                    break;
                case "belongsToMany":
                    $implementations .= $this->getBelongsToManyImplementation($relation);
                    break;
            }
        }

        return $implementations;
    }

    /**
     * @param string $relation
     * @return string
     */
    protected function getBelongsToImplementation($relation)
    {
        $model = $relation['model'];
        $name = $relation['name'];
        $col = Str::upper(Str::snake($model) . $this->idForeignColumnSuffix);


        return "\t/**
\t * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
\t */
\tpublic function $name()
\t{
\t\treturn \$this->belongsTo($model::class, self::COL_$col);
\t}\n\n";
    }

    /**
     * @param string $relation
     * @return string
     */
    protected function getHasManyImplementation($relation)
    {
        $model = $relation['model'];
        $name = $relation['name'];

        return "\t/**
\t * @return \Illuminate\Database\Eloquent\Relations\HasMany
\t */
\tpublic function $name()
\t{
\t\treturn \$this->hasMany($model::class);
\t}\n\n";
    }

    /**
     * @param string $relation
     * @return string
     */
    protected function getBelongsToManyImplementation($relation)
    {
        $model = $relation['model'];
        $name = $relation['name'];

        $table = empty($relation['pivot']) ? "'${relation['table']}'" : $relation['pivot'] . '::TABLE';

        return "\t/**
\t * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
\t */
\tpublic function $name()
\t{
\t\treturn \$this->belongsToMany($model::class, $table);
\t}\n\n";
    }

    /**
     * @param string $name
     * @param string $without
     * @return string
     */
    protected function getShortName($name, $without)
    {
        return trim(Str::replaceFirst($without, '', $name), "_");
    }

    /**
     * @return string
     */
    protected function getNs()
    {
        return $this->getDefaultNamespace($this->rootNamespace());
    }

    /**
     * @param Connection $connection
     * @return array
     */
    private function getTablesWithColumns(Connection $connection): array
    {
        if (!$this->tables) {
            $tableNames = $connection->getDoctrineSchemaManager()->listTableNames();
            $data = [];
            foreach ($tableNames as $tableName) {
                $data[$tableName] = $connection->getSchemaBuilder()->getColumnListing($tableName);
            }

            $this->tables = $data;
        }

        return $this->tables;
    }

    /**
     * @param string $table
     * @return mixed
     * @throws \Exception
     */
    private function getColumns(string $table)
    {
        if (!$this->tables) {
            $this->getTablesWithColumns($this->connection);
        }
        if (!isset($this->tables[$table])) {
            throw new \Exception("Table `$table` not found in schema cache");
        }

        return $this->tables[$table];
    }

}
