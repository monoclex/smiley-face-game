// https://github.com/snowpackjs/create-snowpack-app/issues/122

const { transform: sucrase } = require("sucrase");
const fs = require("fs/promises");
const path = require("path");

const CREATE_ICON_SHIM = `
({
  __esModule: true,
  default: (() => {
    // proper ES6 imports will be injected for 'React' and 'SvgIcon'
    function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
    
    var _default = function _default(path) {
      var Icon = React.memo(React.forwardRef(function (props, ref) {
        return /*#__PURE__*/React.createElement(SvgIcon, _extends({}, props, {
          ref: ref
        }), /*#__PURE__*/React.createElement("path", {
          d: path
        }));
      }));
    
      Icon.muiName = 'SvgIcon';
      return Icon;
    }

    return _default;
  })()
})
`;

function inject(location, length, str, inject) {
  return str.slice(0, location) + inject + str.slice(location + length);
}

/** @param {string} contents */
function es6ifyIndexJs(contents) {
  throw new Error("do not import index.js of mdi-material-ui");
}

/** @type {import("snowpack").SnowpackPluginFactory} */
module.exports = function fixMdiMaterialUiPlugin(config) {
  return {
    name: "snowpack-plugin-fix-mdi-material-ui",
    async transform({ id, fileExt, contents, isDev, isHmrEnabled }) {
      if (id.endsWith("mdi-material-ui/index.js")) return es6ifyIndexJs(contents);

      // replace the require to "./util/createIcon" with our own shim
      const searchStr = `require(${JSON.stringify("./util/createIcon")})`;
      const createIconLocation = contents.indexOf(searchStr);
      if (createIconLocation === -1) return { contents };

      let injectShim = inject(createIconLocation, searchStr.length, contents, CREATE_ICON_SHIM);

      // ES6-ify this module
      injectShim += "export default _default;";

      injectShim =
        `
import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

// silence weird errors
var module = { exports: {} };
var exports = module.exports;

` + injectShim;

      return {
        contents: injectShim,
        // map: transformed.sourceMap,
      };
    },
  };
};
