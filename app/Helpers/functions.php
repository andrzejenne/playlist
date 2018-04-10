<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 10.4.18
 * Time: 17:32
 */

if(!function_exists('getValue')) {
    function getValue(&$var, $def = null) {
        return isset($var) ? $var : $def;
    }
}