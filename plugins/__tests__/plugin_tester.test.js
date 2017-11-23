import configFile from './../../core/config';
import fs from 'fs';
import glob from 'glob';
import { shallow } from 'enzyme';
import BasePlugin from '../../core/editor/base_plugin';
let PJV = require('package-json-validator').PJV;

describe('plugins package.json is well formed', ()=>{

    beforeEach(jest.resetModules);
    const plugins = glob.sync("plugins/*/package.json");

    plugins.forEach((element) => {
        test('JSON ' + element + ' is well formed', ()=>{
            expect(PJV.validate(fs.readFileSync(element, 'utf8'), "npm").valid).toBeTruthy();
        });
    });
});

let plugin_folders = glob.sync("plugins/*", { ignore: ["plugins/__tests__", "plugins/plugin_dependencies_loader.js"] });
const pluginList = configFile.pluginList;
plugin_folders = plugin_folders.filter((element) => pluginList.includes(element.split("plugins/")[1]));

plugin_folders.forEach((plugin)=>{

    describe('plugin main file is correctly formed', ()=> {
        beforeEach(jest.resetModules);
        global.Ediphy = jest.fn({});
        global.Ediphy.i18n = jest.fn({});
        global.Ediphy.i18n.t = jest.fn((n)=>"translation");

        // test(plugin.split("plugins/")[1] + ' main file exist', () => {
        //     let main_file = fs.readFileSync(plugin + "/" + plugin.split("plugins/")[1] + ".js", 'utf8');
        //     expect(main_file).toBeTruthy();
        // });

        let baseplugin = new BasePlugin();
        let current_plugin = require.requireActual("./../../" + plugin + "/" + plugin.split("plugins/")[1])[plugin.split("plugins/")[1]](baseplugin);

        test(plugin.split("plugins/")[1] + 'plugin can be imported', () => {
            expect(current_plugin).toBeDefined();
            expect(current_plugin).toHaveProperty('getConfig');
            expect(current_plugin).toHaveProperty('getToolbar');
        });

        test(plugin.split("plugins/")[1] + ' getConfig correctly formed', () => {
            let config = current_plugin.getConfig();
            expect(config.name).toBeDefined();
        });

        if (current_plugin.hasOwnProperty('getInitialState')) {
            test(plugin.split("plugins/")[1] + 'plugin has initialState and is valid', () => {
                expect(current_plugin.getInitialState()).toBeTruthy();
            });
        }

        if (current_plugin.hasOwnProperty('getRenderTemplate')) {
            test(plugin.split("plugins/")[1] + 'plugin has getRenderTemplate and is valid', () => {
                const pluginRender = shallow(current_plugin.getRenderTemplate(current_plugin.getInitialState()));
                expect(pluginRender).toBeTruthy();
            });
        }

        if (current_plugin.hasOwnProperty('getConfigTemplate')) {
            test(plugin.split("plugins/")[1] + 'plugin has getConfigTemplate and is valid', () => {
                expect(current_plugin.getConfigTemplate()).toBeTruthy();
            });
        }

        if (current_plugin.hasOwnProperty('afterRender')) {
            test(plugin.split("plugins/")[1] + 'plugin has afterRender and is valid', () => {
                expect(current_plugin.afterRender()).toBeTruthy();
            });
        }

        if (current_plugin.hasOwnProperty('handleToolbar')) {
            test(plugin.split("plugins/")[1] + 'plugin has handleToolbar and is valid', () => {
                expect(current_plugin.handleToolbar).toBeTruthy();
            });
        }
    });

    describe('plugin visor file is correctly formed', ()=> {
        test(plugin.split("plugins/")[1] + 'plugin has visor', () => {
        });
    });

});
