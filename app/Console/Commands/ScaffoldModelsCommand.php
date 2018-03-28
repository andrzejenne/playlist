<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Helpers\Str;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Connection;


/**
 * Class ScaffoldModelsCommand
 * @package EnneSystems\GraphQL\Console
 */
class ScaffoldModelsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scaffold:models';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scaffold all models according to database';


    /** @var Connection */
    protected $connection;


    /** @var array */
    protected $tableBlacklist = [
        'migrations',
    ];


    /**
     * ModelMakeCommand constructor.
     * @param Filesystem $files
     * @param Connection $connection
     */
    public function __construct(Filesystem $files, Connection $connection)
    {
        parent::__construct();
        $this->connection = $connection;
    }

    public function handle()
    {
        $models = static::getAllModels();

        $usedTables = [];

        foreach ($models as $model => $modelCls) {
            if ($model != 'BaseModel') {
                $reflection = new \ReflectionClass($modelCls);
                $table = $reflection->getConstant('TABLE');
                if ($table) {
                    $usedTables[$model] = $table;
                } else {
                    $this->warn("Model $model has no table defined");
                }
            }
        }


        $tables = $this->getAllTables();

        $notUsed = array_diff($tables, array_values($usedTables), $this->tableBlacklist);

        $undefinedModels = [];

        foreach ($notUsed as $table) {
            try {
//                $column = $this->connection->getDoctrineColumn($table, BaseModel::COL_ID);
                $model = ModelMakeCommand::getTableModelName($table);
                if (isset($models[$model])) {
                    // @todo probably pivot with id
                    $this->warn("Model $model allready defined");
                } else {
                    $undefinedModels[] = $model;
                }
            } catch (\Exception $e) {

            }
        }

        foreach ($undefinedModels as $model) {
            $this->info("Creating $model");
            $result = $this->call('gen:model', ['name' => $model]);
            if ($result) {
                $this->warn("Model $model was not created");
            }
        }
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function getAllTables()
    {
        $driver = $this->connection->getDriverName();
        $tables = [];

        switch ($driver) {
            case "pgsql":
                $result = $this->connection
                    ->select('SELECT table_name as table FROM information_schema.tables WHERE table_schema = \'public\'');
                foreach ($result as $row) {
                    $tables[] = $row->table;
                }
                break;

            case "mysql":
                /** @var \PDO $pdo */
                $pdo = $this->connection->getPdo();
                $statement = $pdo->query("SHOW TABLES");
                $statement->setFetchMode(\PDO::FETCH_ASSOC);

                if (true === $statement->execute()) {
                    foreach ($statement->fetchAll() as $row) {
                        $tableName = reset($row);
                        if (Str::plural($tableName) == $tableName) { // avoid not plurals, probably many to many
                            // @todo - only tables with id col will be models
                            $tables[] = reset($row);
                        }
                    }
                }
                else {
                    throw new \Exception('invalid query');
                }
                break;
            default:
                $this->error('getAllTables - DB Driver ' . $driver . ' not implemented');
        }

        return $tables;
    }


    /**
     * @return mixed
     */
    public static function getAllModels()
    {
        $dirs = config('app.models.location');

        $models = [];

        foreach ($dirs as $dir) {
            $namespace = null;
            foreach (glob($dir . DIRECTORY_SEPARATOR . '*.php') as $file) {
                if (!$namespace) {
                    $namespace = static::detectNamespace($file);
                }
                $fileName = basename($file);
                $modelName = substr($fileName, 0, -4);

                $models[$modelName] = $namespace . '\\' . $modelName;

            }
        }

        return $models;

    }


    /**
     * @param $file
     * @return mixed
     */
    private static function detectNamespace($file)
    {
        $content = file_get_contents($file);
        preg_match_all('/namespace\s+(.+);/', $content, $matches);

        return $matches[1][0];
    }


}
