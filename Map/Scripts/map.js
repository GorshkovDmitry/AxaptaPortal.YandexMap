//Service constants
const SERVICE_URL = "http://axportalbroker.parkgroup.local:8733/AxaptaProxyService/";

//Vars
var map = null;
var poligons = new Array();
var selectPoligon = null;
var geoResult;
var searchControl; //GorDS, 04.04.2016 Добавление поиска

// Create Base64 Object
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

//Init map
function init() {
	map = new ymaps.Map("map", {
	 	center: [43.12761611, 131.977039584], 
		zoom: 10,
		controls: ["fullscreenControl", "zoomControl"]
	});

    //GorDS, При нажатии на карту - если это не зона - очистить текущую -->
    map.events.add("click", function (event) { 
        removeSelectedPoligon(
			false //task21501 08.09.2016, GorDS
		);
    });
    //GorDS, При нажатии на карту - если это не зона - очистить текущую <--

	addSearchControl(); //GorDS, 04.04.2016 Добавление поиска
}

function geocodeAddress(address) //task21501 08.09.2016, GorDS
{
	var myGeocoder = ymaps.geocode(address);
	
	myGeocoder.then(
		function (res) {
			map.setCenter(res.geoObjects.get(0).geometry.getCoordinates()); //Центрирование
			setSelectPoligon(res.geoObjects.get(0)); //Нажатие на найденный объект
		},
		function (err) {
			alert('Не найден указанный адрес');
		}
	);
}

function addSearchControl() //GorDS, 04.04.2016 Добавление поиска
{
	ymaps.load(function () {
		suggestView = new ymaps.SuggestView('MainContent_unloadAddr', {
			offset: [40, 160]
		});
		
		//Выбрали адрес
		suggestView.events.add('select', function(e){
			var index = e.get('index');
			var address = e.get('item').displayName;
			
			geocodeAddress(address);
		});			
	});
}

function removeSelectedPoligon(removeZoneId){ //GorDS, Очистка текущей зоны
    //selectPoligon.options.set('strokeWidth', 0.2); //task21501 Закомментировал 08.09.2016, GorDS
    
    map.geoObjects.remove(selectPoligon);
    map.geoObjects.add(selectPoligon);
    selectPoligon = null;
	
	if (removeZoneId)
		$("#MainContent_zoneId").val(""); //Очистка Id зоны
}

function OnMapChangeEvent(jsonBase64String)
{
	//Тестовая строка. Необходимо заменить на AJAX запрос.
	//jsonString = '{"Factory":"sct","Center":[43.113029230678066,131.9248545254062],"Zoom":11,"Poligons":[{"Name":"о. Русский","Color":"#53c21b","Coords":"qtOPAqpz2gcI_v__DwoAAL3w__9yEwAAfgAAAGYLAAD0AgAAxBAAAOUGAABsDwAA6AUAALgIAADoBQAAqf7__-QGAABpDQAAegEAAMcSAAC18v__sgQAAIb-__-1BgAA2QkAAAAAAAD8AAAAtQYAAKH3__9jCQAAgv___10FAAAY-v__BgQAAPgBAABjCQAAmfn__yEWAACh9___vgwAAK30__8DAgAA8AMAAGkNAACG_v__uAgAAErt__8DAgAAsPP__2AHAABvBAAAwQ4AAI78__9pDQAApfb__2MJAACV-v__rwIAAIr9__9jCQAAlfr__7gIAAC08v__WgMAAJ34__9aAwAAcwMAAA8KAACV-v__uAgAAH4AAAASDAAA-AEAAAwIAAD4AQAAuAgAAFgKAAAMCAAA5QYAAL4MAAAM_f__CQYAAJX6__9aAwAAcwMAAGYLAADhBwAAuAgAAOUGAAD9_f__1goAABsSAAB-AAAAuAgAAGcGAAAPCgAA4QcAAAAAAAD8AAAAZgsAAJ34__8PCgAAF_r__xIMAAAn9v__YAcAAB_4__9XAQAADP3___r7__8AAAAAS_n__xf6__-vAgAAkfv___39__-N_P__mvT__5H7__9XAQAAIvf__68CAACN_P__RfX__438__9aAwAA9QIAALgIAAAT-___tQYAAKz0__9U____E_v__532__8L_f__S_n__xf6__8AAAAA9QIAALUGAAB6AQAADwoAAOYGAABaAwAAWAoAAF0FAADWCgAACQYAAFwJAAAAAAAARQ8AAF0FAAAAAAAACQYAAL8QAAAGBAAAVwoAAGMJAAAE____aQ0AABv5__-yBAAAH_j__6b8__8m9v__WgMAAO0EAAC4CAAAjfz__wkGAADpBQAAWgMAAHYCAAAPCgAAawUAALUGAAD4AQAAvgwAAFHr__9pDQAAjfz__7gIAABnBgAAsgQAAEgOAACj-v__ZwYAAKD4__9yAwAAoPj__2cGAAC1BgAAawUAAAwIAADCDwAAsgQAAOEHAABvEQAAwQ8AAH4bAADBDwAAGBAAAC8UAABjCQAAQw8AAB4UAADEDgAAbA8AANQKAAAAAAAA6AUAAEj3__-a-f__S_n__wz9__9L-f__AAAAAEj3___cCAAA9_n___QCAAC4CAAAbgQAAAMCAADkBgAAoPj__-AHAACvAgAA1AoAALUGAACrFAAAHhQAAC0UAADBDgAAVQoAAFH9___0AgAAoPj__2EHAAD09___aQUAAJ32__8V-___mvT__6P3__-j-v__Ifj__1oDAADjBgAAXQUAAHoBAABgBwAAjvz__2MJAAAh-P__AwIAAJL7__-sAAAAGPr___f5__8M_f__SPf___wAAACj-v__T_z__036__8c-f__rQEAAFP7__-d9v__KPb__1T___8I_v__7vP__xT7___3-f__fgAAADzv___4AQAA8fX__2YGAAD09___zwsAALIEAADbCAAACQYAAL8PAACX8v__1wkAAFcBAAAAAAAA8fX__2EHAABL-f__2wgAAFoDAAD0AgAAvgwAAAAAAAAMCAAAzwsAAAkGAAB2AgAAuAgAAPQCAADo7___hv7__5Hu__9yAwAA6_H__5v5___x9f__jvz__6D4___0AgAAl_L__1kJAABC8___bQQAAP_-__9dCAAAXQUAAGUGAAAAAAAAfgAAAEv5___OCwAAUf3__0MOAAAGBAAAfgAAAGMJAADnBQAAYwkAANIKAABgBwAAyQwAAE77__-4EAAAEgwAAGAHAAAGBAAAbQQAAELz__9xAwAARfX__-sEAADr8f__3gcAAKb8__8a-v__ytv__xr6___x9f__BP___47s___vAwAANOn__2kFAACU8P__Df3__5fy__9-AAAA4uv__4v9__-X8v__k_v__0v5__9xAwAAheb__3EDAAD3-f__egEAAEv5__9CDgAAVP___2AHAAD6-___hv7__x_b__9kBgAARfX__xX7___r8f__Ivj__077__-k9___tQYAABr6___9_f__WPr__6H5__9M_f__VP___0f-__9aAwAAwf___7MFAACX-v__BAMAAD8AAABaAwAALgQAALMFAADF_v__EAsAAG0EAAC2BwAABP___wcFAADS-___sAMAAMr9__8HBQAAfgAAAAkGAAD4AQAAtQYAAMX-__9cBAAAfgAAAAwIAAB-AAAADAgAAEf-__-yBAAAl_r__7IEAABY-v__AAAAAA39___9_f__yv3__wMCAAAuBAAAaw4AAPwAAAC7CgAAhv7__wYEAACP_P__WQIAAFD8__-q____Gfr__wMCAACg-P__rwIAAM78__8HBQAAi_3__2UKAAAE____CgcAANL7__9cBAAAhv7__7MFAADO_P__XQUAAN74__-sAAAAQ____woHAACT-___ZgsAAA39__8NCQAAwf___7IEAAC5AQAAVwEAAIL___9cBAAAk_v__wEBAADW-v__U_7__4b-__-k-___-AEAAKD4___B____9_n___gBAAD6-___Efz__-7z__-P_P___Pz__0P____6-___9AIAAPz8__8I_v__p_3__xH8__9ZAgAACP7__wMCAAD78f__U_7__z8AAABdBQAAhv7__1wEAADJ_f__rAAAAMX-__-n_f__R_7__6wAAADF_v__BwUAAI78__8BAQAADP3___z8___e-P__qv___0_8__-q____CP7__1P-__-C____BgQAAC8EAAAKBwAAcgMAAK8CAAB-AAAABwUAAIr9__8EAwAAEPz__6f9__9L_f__rAAAAAz9__-yBAAAvQAAALADAABH_v__WgMAAAz9__9XAQAAFfv__6n-__-K_f__AAAAAIr9__8GBAAAR_7__7MFAADl_f__AAAAAEv9__-q____hv7__wMCAACK_f__AAAAAEf-__-p_v__T_z__7ADAADN_P__sAMAAD8AAABcBAAAJwYAALIEAAC9AAAAZQoAAEf-__8KBwAA1fr__7IEAADN_P__qv___9H7__9N-v__jvz___n6__-S-___U_7__34AAAC1BgAAxf7__7MFAAAU-___VgAAAM38__8GBAAAT_z__6n-__8M_f___Pz__5L7__9ZAgAAxf7__1wEAAA7AQAABAMAAPgBAAABAQAAdgIAAAkGAAAE____WgMAAC8EAAAJBgAAvQAAAF8GAABL_f__sgQAAIr9__8AAAAAwf___1wEAAAI_v__VgAAAJb6___3-f__CP7__6T7___B____ofn__xT7__9C8___iv3__1P-___F_v__WgMAAOwEAAAQCwAAyf3__wkGAADN_P__AwIAAM38__-n_f__kvv___T3___R-___pvz__xT7__9XAQAAzfz__7MFAADd-P__rwIAAAz9__9T_v__gv___7ADAADN_P__XwYAALEDAABfBgAAuQEAAF0FAAAM_f__YAcAANX6__9ZAgAAlvr___f5__8M_f__Svj__wz9___8_P__S_3__7IEAAAM_f__BAMAAE_8__-p_v__1fr__woHAAAM_f__rQEAAJL7__-p_v__yf3__6T7__-O_P__AAAAAI78___2-P__jvz___z8__9H_v__-fr__70AAABN-v__sQMAAKP6__8nBgAArAAAABgKAAD9_f__ZgYAAKr____UCgAATfr__7kBAAADAgAA3QAAAKf9___ZAQAA1P7__9kBAABWAAAA0AsAABn0__-1AgAAf____wT___-n_f__IAAAACb9__83-v__8_b__0P___8l_P__hv7__1P-__8gAAAAp_3__7UCAADU_v__mgEAAP_-__-eAAAAUPz__90AAAD6-___tQIAANT-__9qBQAAtgcAAI0EAADV____YgcAAAYEAAChBwAA-vv__xcCAABQ_P__CwUAANH8__9OBAAAVgAAAEoFAAAj-___MwMAAHj6___cAAAA_Pz__3IDAABQ_P__kQMAANcAAAATAwAAKwAAAMgFAADR_P__rQQAAJ73___gBgAA7vn__9QCAACq____NwIAAFkCAAB2AgAAVgAAAPQCAAADAgAA3AAAAH7-___YAQAAfv7__z8AAAD9_f__xf7__9H8__9L_f__pvz__8H___9T_v__pv7__1T___8fAAAAfP3__wj-___9_f__wf___yb9__9aAQAAp_3__5kBAAAAAAAAegEAANH8__8bAQAA1wAAADcCAACp_v__HwAAACj-__8HBgAA1P7__y0CAABO-___UgMAAH_____MBAAAefv__yIHAABR_f__vQAAAKb8___2CQAACgcAAOwDAADn-v__kQMAAE36___8AAAAzPn__3IDAAB7_P__7wMAAIEAAACsBAAAKP7__zMDAABWAAAAqAUAAHz9___8AAAAJv3__04EAABU____TgQAAOAGAABD____sgQAAPgBAADXAAAA-AEAAFP-___cAAAATvv__20EAAAc9v__EwMAAOvx__9pBQAAwvL__xcCAAB8_f__wf___6P6__8bAQAA-vv__2f-__8f-P__PwAAACP7__-5AQAAHff__-H____I9v__nQAAAKf9__9j____GfT__34AAABQ_P__-AEAAAAAAAB-AAAA0v3__x8AAAAo_v__GwEAACj-__92AgAAAAAAANwAAAAg-f__lQIAAHv8__9SAwAA_f3__9ADAABR_f__-AEAAH_____B_____Pz__8H____5-v__UPz__532___F_v__UPz__-n9__9I9___xf7__5Tw__9aAQAAG_X___gBAADS_f__mQEAANT-__-9AAAAU_7__2kFAAD8_P__TgQAACsAAACVAgAAAQEAALQCAABT_v__8wIAANcAAACjBgAAfv7__-8DAACj-v__bwsAAIQCAAAyAwAAqf7___gBAAD5-v__CgUAAE77___UAgAAAwIAAJkBAAAAAAAAGwEAACX8__82AgAAJv3__8H____8_P__yv3__9T-__-X-v__VgAAALP7__9Q_P__Xfn__8b1__-P_P__nvf__4b-__9v9P__KP7__xn0__9n_v__AAAAAHT7___P-___6f3__9X____O_P__VwEAAHT7__8l_P__xf7__4IBAADB____tgcAAEf-__8JBgAAt_r__10FAAAE____2AEAANwAAABZAgAApv7__2AHAADl_v__sAMAAID4__-2BwAAnQAAAK0BAABn_v__rAAAAOn9__9U____ePr__yj-__8R_P__UPz__8n9___L-P__cQMAAKD4__9aAQAAKf___z8AAACn_f__7wMAACX8___8AAAApvz__4_8__9K-P__3AAAACL6__9H_v__Uf3__wT___9U____BP___yj-___l_v__VgAAAJ0AAADaAgAA8fv__7ADAADl_v__MgUAAIL___-zBQAA1vr__4cEAAA9-f__2AEAAOX-__-p_v__Q____ywBAAAI_v__rQEAAAz9__9_____Ffv__3z9___1-v__SPf__97-__-L____4f___9oCAABn_v__ggEAAJP7__8AAAAABP___wQDAAAE_v___v___4b-__8BAQAAPwAAAIgFAADcAAAABgQAADT7__9fBgAAMPz__4EAAACO_P____7__zD8___8_P__qv3__wAAAADF_v__LwMAACT___8sAQAAxf7__6r____l_v__1P7__4b-__8rAAAAY____wQDAADcAAAAWgMAAF4AAACEAgAACP7__wQDAAAo_v__ggEAAMn9__-BAAAAR_7__4UDAABH_v__ggEAAPX6___U_v__svv__077__-S-___9Pf__-38___z9v__xf7__6T7___8AAAAoPj__2P____I9v__GwEAACL6___IBQAApPv__yYGAACq____9AIAAHz9__-RAwAAqf7__6gFAABaAwAA2AEAANX___9SAwAAUPz__4UGAAAsAQAArAQAACP7__-VAgAAz_v__wAAAACm_P__CP7__yn___-K_f____7__0v9___S_f__a_3___r7__9P_P__QfL__8X-__9O-___JP___9X___9n_v__4AYAAAT___-FAwAAVPv__7ADAAAZ-v__WQIAAEv9__9WAAAAWPr__yb9__---P__8_b__7L7___q8P__wfv__7P7__-O_P__S_n__yj-__8p____a_3__wAAAAAM_f__fv7__5f9__-sAAAAS_3__1T___9n_v__rQEAAGv9___V____rvz__9H8__-K_f____7__4r9__-BAAAA0fv__9X___8s_f__BAMAAMX-__9XAQAAa_3__4EAAAC--P__4wgAABD8__8KBwAAov___68CAAD2_P__4AIAAK78__9XAQAAKP7__wYEAAAXAgAArQEAAPgBAAAAAAAAWgEAAKT7__8LBQAAIvr__04EAAAvAwAA8AMAACwBAABqBQAAZgsAAPgBAADhBwAAwf___2MJAACm_v__MgUAAEv9__9WAAAABP___60BAACq_f__1P7__0_8__9T_v__5f7__4EAAABH_v__BgQAACz9__-wAwAA8fv__6wAAAC2-v__fP3__xD8__9Q_P__zfz__077__-G_v__U_7__0f-__-q____ov___60BAABeAAAArwIAAGf-__-EAgAAAAAAAC4CAAByAwAA3QQAAJkBAAAp____MwMAAK0BAACxAwAABwUAAPgBAACzBQAAAAAAAAkGAAD0AgAAhAIAABMDAAAJBgAAvQAAALMFAADl_v__igYAAEf-__-FAwAAKP7__4QCAAAE____VP___8H____S_f__R_7__1P-__9j____p_3__4b-__8p____BP___wMCAAAk____AQEAACj-__9U____hv7__4QCAADJ_f__KwAAAIb-_____v__pv7__1T___-m_v__LAEAAOj9__9_____jvz__9gBAAAI_v__VgAAAFP7__8o_v__7Pz__yj-__9y-___o_r__9n5__-d9v__0fv__8Pz___F_v__RfX__70AAAB5-___fgAAAG_0__-1AgAAl_L___gJAABL-f__7AQAAHb5__83AgAA-fr__-D___-g-P__fgAAAFH9__96AQAA0v3__70AAADP-___tQIAAKb8__8nBgAAKP7__14AAABL-f__egEAANL9__-ZAQAAf____7kBAAAi-v__4f___z_x__9-AAAASvj__1oBAACm_P__EwMAAPz8__-5AQAAe_z__5UCAADO-v__UgMAAKP6__-5AQAA9_n__7kBAABR_f__xf7__3____-C____KwAAACT___-p_v__Z_7__z____-a_f__AAAAAAj-__-q____1f7__9T-__-G_v__UPz__wAAAAC9_f__cv___xT___9X_v__1f___xT___8sAQAAov___wMCAAAfAAAAmwMAAKb-___DAQAA9vz__20AAADN_P__P____2r9__9n_f__CP7__8_7__83_v__-vv__yP____5-v__4P___2X8___F_v__fP3__0P___-9_f__2f3__-n-__8c_f__FwEAAOT-___BAAAAiv3__ysAAACW_v__bQEAANX-__8xBAAA5P7__7IEAAAE____VwEAAGb-__-WAAAAiv3__6r___-l_v__lf___0v9__-n_f__S_3__zz9__8j____wP___-D____sAAAAfgAAAC8DAADB____hQMAAJb-___uAQAAGP7__4UDAACG_v__7gEAAFv9__8BAQAACP7__wAAAAAr_f__k_7__zf-__-p_v__av3__2X8__-G_v__0v3__wj-__9N-v__sf___-j9__-h____zvr__18AAACn_f__zQAAAOj9__8MAQAAU_7__1sBAABT_v__OwEAAJX___9PBAAAxgMAAFsBAAAVAAAAegEAACn___8MAQAAU_7__xAAAAB-_v__cv___37-___R____e_z__xAAAADU_v__U____6n-__-x____vv7__9H___-T_v__EAAAAOn-__9T____AAAAAFP____A____wf___9X___9H____KwAAAIr-__-sAAAA_P7__zAAAABm____4P___3r___8gAAAAxf___5EAAABLAAAAGgMAAIb___-CAQAA9P7__xIBAAAE____xgAAAGL___8XAQAAYv___zMCAACh____jQEAAIb___-WAAAAK____wAAAAAI____wP___3L____w____3f7__3EAAACK_v__QgEAAD_-__8BAQAA2f7__x4CAACO____dAIAAJb____MAAAAsf3__0kCAAA3_v__nQEAAAj____6AgAA7P___1UDAACa____ZwEAAKn___8zAgAAX____-cAAACx____nAAAAPz____dAQAASPz__9QGAAACAAAA9____wAAAAAAAAAAAAAAAAAAAAA="},{"Name":"г. Владивосток","Сolor":"#a91bc2","Coords":"kT2RAjLE2wdPAAAA7AAAAI4AAAAVAAAA_AAAAKn-___AAwAAEf3__0YCAABAAAAA9wEAAP39__-OAAAA__7__z8AAAB-_v__vQAAAP_-__-kAgAAKf___7ADAAABAQAAdQIAAFcBAAAXAgAAbgIAABsBAADsAAAAJP___4IBAAB-AAAAmAEAAKQCAACbAwAAuAEAAHMFAADB____3QQAAGP___8YAgAAU____-8CAABT____2AEAABAAAAAYAgAAvQAAAMQCAADR____8QMAALgBAADHBAAAkv___1kCAADcAAAABAMAAI4AAADaAgAAyAEAALADAABlAgAAAwIAAAMDAABGBAAAXgAAAFcBAADzAgAAmQIAAOMCAAAxBAAAuAEAAAAAAADTAgAAmAEAAN8DAAAaAwAAsAMAAO8CAABPAAAArAAAAJL___9DAgAAwf___9cAAACdAAAArAAAAHUCAABuAgAAOwEAAIEAAAAvAAAALAEAACT___9CAQAAJP___xcBAADh____AQEAAEoBAACwAwAA9wEAABoDAADsAAAAQgEAAC8AAADDAQAAjBoAAJwfAACdAAAAAAAAAOYFAAA8_f__9AYAAP3u__-OAAAAqv___ysBAACtAQAAlhcAAOQmAAApAgAAKf7__wkFAABdBQAA3gMAAMoGAAAOBAAAFQAAAC8AAACsAAAArQAAAEAAAAAAAAAA7AAAAIIQAAAnCQAAqAEAAKEHAACx____7AAAANP7__-ZAgAAGf7___UGAAAOBAAAaP7__8r9__8jCQAAGf7__xT___9M_f__zwkAADYCAAAsAQAASgEAABsEAAAfAAAAwwEAAKv9__-BAAAABP___xcBAABaAQAAjgkAAKQCAACV____5wEAAIAOAABw_P__aQ0AAEP____xAwAAtAIAABcBAACNAAAAgQAAAMYFAACsAAAAEAAAACwBAACH_v__FQAAAKj6__8U____kv___z____9I_v__AAAAAFX7__-8CwAAe_3__7ESAAAL-v__xxIAAAsBAAAGBAAAov___zgJAAA4_v__xgMAAGP___9mCwAABwIAAMEAAAC6_f__fAsAAG4AAAAsAQAAwf____EDAAAk____AwIAAC8AAAABAQAAFP___8MBAADl_v__Kf___1j-__8vAwAAHwAAANcAAABT____QAAAAOP7___6-___U____2sAAADV_v__dfj__3L____U_v__zAAAAHz9___B____Kf___yT___9WAAAAFP___5P-___1_v__fv7__zT___89_v__TwAAALzu__9-AAAAwP___wAAAADR_P__lv7__-v____R____6f7__xsBAAAAAAAALwAAADH2__9D____f____3L___8_____HwAAAHb5__8LAQAAAAAAAD8AAACM6___tv7__9X___9KAQAAXPb__2P____U_v__zAAAAGj-__9KAQAA1f___4UCAAB77v__TwAAAAr4___sAAAAwP___-MCAAAd6P__uv3__xT___8QAAAAIPn__zT____o_f__XgAAAPb4__-b_f__z_v__xAAAADo_f__qvX__xXu__-v_P__t_n__4D8__8g-f__Pvn___z8__--9f__LwMAAHb3___P-___bP3__5P-__-b_f__-vv__730__8V-v__5f7__9oCAAD1_v__av____D______v__o_v__2f9__--_P__AAAAADT___9XAQAAs_v__24CAADK_f__mQIAAIL___83CAAAZQIAALYHAAB5AQAAVP___5kBAACIBQAArAsAAMIPAAC9AAAAqv___98DAADYDwAAqQAAAOD___8rAQAAkAMAAI4AAABWAAAALwAAAOMBAACa____zAAAAOgBAAAHBQAAjgAAAMr___9iAQAAegMAALH___8OAgAAjv7__5____8M____VgAAAN3-___YAQAArQAAANcAAAA7AQAA3f3__7gBAAC2AAAAY____-QCAAA0____7AAAAIL___8sAQAA3f7__wEBAABT____AAAAADL6__9C-v__h_7___T-__9D____vv7__2_-__80-P__sv3__8j2__9M_f__Fvn__2T7__-k-___SP7__0r___9I_v__Ev7__0j-__-S_f__UPz__-j9___n-v__fv7__xH8__9GBAAAlv7__4UDAABD____Kg4AAOX-___xAwAATP3__-8CAADR____LgIAALr9__8vAwAADPb__9AKAACC____AAAAAAT___8U____BP___1YAAAAAAAAAQgEAAEoBAAAuAgAA_gMAACYLAAAnAgAA7AAAAK0AAAAyBQAAhv7__0YEAAAY_v__1wAAAEP___--_v__LwAAAL7-___V_v__f____3L___-BAAAAmQEAAJwEAABX_v__7gEAAOH___-vAgAANP___xoDAADR____xwQAAH4AAADvAgAArQAAAOwAAADMAAAAYwkAAH4AAAADAgAAEAAAAAMCAACS____1wAAAJ0AAABtAQAAnQAAABgCAAAHAgAALgIAAJ0AAAAVAAAA8wIAAF0FAADUAgAALgIAAH4AAADsAAAAuAEAAG0BAAB1AgAAggEAACIDAAAvAwAA2wQAAOAGAADMAAAAWgMAAEP___8dBQAAgv___4IBAACm_v__rAAAAOX-__8R_f__vPn__-v___9y____1wAAAKb-__8AAAAAlv7__9cAAADw____RgQAAHv9__9AAAAA5f7__9T-__-m_v__VgAAACj-__8YAgAAU____1cBAACL_f__bgIAAGP___-CAQAAtv7__ysAAAD1_v__WQIAAEP___9_____wf___yn___8vAAAAk_7__7H___8U____cv___ysAAABy____AQEAANX-__8DAgAATwAAANcAAADsAAAAlf___2oBAACtAQAAJP___3ADAACq_f__swUAAKb-__8BAQAAMfz___gIAACz-___GgMAANn9___U_v__JP___xUAAAAAAAAA1P7__7b-___p_v__vQAAAOP6__9j____VP___z8AAABT_v__Q____1T___8AAAAAk_7__44AAAB_____0f___1T___-C____AAAAAKL___9_____HwAAABL-__9qAQAAAAAAACT___9U____0f___5D8__8LAQAAJfz__wAAAADL-P__7AAAALT3__9-AAAAWfT__ysBAACe9___TP3__wX1__9N-f__H_j__zz9__-sAAAAHwAAABoDAABj____AQEAAJb-__8VAAAAqv3__yn___88_f__qf7__0z9__8VAAAAuv3__2X8___w____Ef3__1P___--_v__xf7__xUAAACm_P__sAMAANH___8DAgAA_AAAAJgBAAA2AgAAlgAAAGYCAAAbBAAAKP7__7MFAACi____sAMAAAn-__8pDQAAY____7UGAABr_f__XAQAAOn9__9dBQAAgv___18GAADrBAAA6g0AAMX-__80BgAA3AAAAIcEAACfBwAAhQMAALEKAAAcEwAACgUAALYHAAAAAAAAOAkAAKb-__-4CAAApwUAAOQJAAC0AgAAtQYAAHEDAACHBAAAHwAAAGAHAAAJ_v__jQgAAEP___8KBwAAXgAAAAcFAACc-f__aw4AANv5__-HBAAARvf__4EAAACz-___zvr__70AAABR_f__5f7__9T-___K_f__qv___2v9__8m_f__k_v__3____9_8f__oPj__1D8___9_f__LP3__9X____K_f__qf7__-38__-q____7fz___z8__-m_v__gQAAAD8AAABXAQAAdQIAAIIBAADl_v__AwIAAJUCAAAuAgAA_AAAALMFAADF_v__kAoAAEz9___YAQAAHwAAAAMCAAC0AgAAfv7__3EDAADYAQAAegEAAKn-__8XAgAA1f___0EHAAAuAgAAQQcAAN0EAACWCQAAf____wMOAADYAQAArAQAAKT7__8TAwAA_Pz__1YCAAAsAQAAewgAANH8__-DBgAALgIAAC4EAADgBgAABw0AAEYSAABeAAAAWgMAABcCAAAp____sAMAAIcEAAAqDAAAWgMAAE0EAABXAQAA7wMAADIFAAAo_v__BAMAAAAAAADaAgAAsAMAADIFAAB1AgAAKP7__3UCAACzBQAAkwEAAGMIAABRAwAAsAMAAEgFAAB3FgAAcQMAALUGAACnBQAANAYAAA4EAAC2BwAAtAIAAAcFAAB1AgAAAAAAAMIGAAAHBQAASAUAANT-__91AgAALAEAAL0AAADaAgAAEgMAAH____-4AQAAWQIAAJkBAACLBwAA4f___1oDAAB5AQAAXQUAAFEDAABcBAAAqwQAADsLAAAfAAAAiAUAANgBAACHBAAATQQAAAQDAAAXAgAA3gUAAPMCAACEAgAAlAIAAFYAAABoBQAABAMAAPwHAADV____YwYAAH_____PAwAAXAQAAM8DAAC7CgAAAAAAAIUDAAD3AQAADQkAAKb-___eBQAAMfz__9oCAADK_f__AwIAAAn-__-EAgAAWgEAAIQCAACZAQAACQYAABYCAADU_v__DgQAAAYEAADTAgAA3QQAABIDAACTDAAA3AAAADIFAAAo_v__hQMAAIv9___bAwAAvQAAANgBAAA2AgAAp_3__9gBAACq____GwEAANgBAACdAAAArwIAAPwAAAADAgAAgv___60BAACLBAAA2wMAAEwEAACq____UQMAAFH9__-C____KP7__1EDAAAp____EgMAANsDAAC9AAAAhAIAAGP___8uAgAAGwEAAIQCAAASAwAArAAAAF4AAABaAwAADv3__4QCAABD____sAMAAGf-__-vAgAAPwAAAFkCAAAtBAAAhAIAAC0EAACEAgAAfgAAAFH9___cAAAA_f3__84DAACq____iwQAAFkCAADTAgAAhAIAAG7___8ZAgAA-wAAAAEBAAA2AgAAAQEAALgBAAAxBAAAAAAAAIQCAAAtBAAAhAIAAB8AAAD9_f__uAEAAKr___8xAwAAKwAAADYCAAAxBAAAXgAAALADAACvAwAAsAMAAO4DAACHBAAA6QQAAP_-__9HBQAA2AEAAK8DAADXAAAAOgEAAFkCAAB5AQAA1f___3kBAABaAwAAswIAAIQCAAB1AgAAsgQAADYCAAAAAAAA0wIAAAwIAADXAQAAVwEAADoBAADU_v__YgYAAIQCAAD3AQAAXAQAAFADAAAGBAAAWgEAAN4FAAA_AAAArQEAAEcFAACHBAAA1wEAAH7-___7AAAA0v3__4L____8_P__WgEAAP_-__8EBgAAggEAAI8DAACFAwAAdAIAALIEAAB9BwAA4wgAAJ0AAAAHBQAA5f7__1cBAABaAQAArwIAAAX___8xBAAAdfv__y8DAAAO_f__Kf___4f-__-EAgAA3AAAANgBAAAWAgAArAAAADYCAAD8_P__RwUAAFH9___bBwAAswUAAPqVAAAMt_3_Yvz__w77___f_P__Svj__2P___9-_v__7vn__8z2__-g_P__4_r__z39___O-v__tv7__2j-__9i_P__Ev7__6D8__-BAAAA_fn__1kCAABH-___QgEAAMD8__8AAAAAsPz___39__8U______7___X-__8AAAAADv3__2X8__9PAAAA1P7__7H___9-_v__NP___-v___-X_v__Ef3__50AAAD__v__wf___2j-__80____6f7__wX___9rAAAAov___-wAAABT____6____8H___8p____9f7__9T-__9z____7AAAAGP___8rAAAAsf_____-__9z____f____xT___9AAAAA1v7__xUAAAAU____1wAAAEf7___m_P__y_3__2f9___6_f__uPr__1j-__-j-v__tv7__yL6___6_f__e_z___78__9T_v__NP___2X8__8F____av___8b-__8rAAAA1v7__yn____6_f__awAAAF4AAADXAAAAiQEAAAAAAADB____ggEAAFj-___XAAAASP7__6wAAAC2_v__P____7v9___O-v__gv___0AAAAAvAAAAhAIAAMb-__-YAQAAl_7__-wAAABI_v__VgAAAF39__8aAwAARP___-4BAABh_P__nAQAAN_8__8bBAAAxPv__8YDAACd9v__zAcAAJf-___sAAAA1v7__8D____1_v__P____0T___9AAAAA8P___0IBAACC____rAAAAG4AAACtAQAARP___1cBAABY_v__VwEAAOr9___r____kv___5YAAABj____lgAAANr9__9ZAgAA9f7__4EAAABW-___6____4f-__-q____Gf7__2j-__-2_v__fv7__4z9___U_v__qPf__8_7___i-P__kPz__4L___8rAAAAc____6n-__9N_f__KP7__8bt__-09___sf___5YAAAAKCAAAMQQAAJ0AAAAxBAAANP___5YAAABY_v__qv___5f-__8p____Hv3__-wAAADq_f__VP___-X-___V____-v3__y4CAACX_v__AAAAADT___-WAAAAFP_____-__8k_____Pz__3QCAADO-v__SgEAAKr___8AAAAAav___6b-__9AAAAAd_7__8EAAAAS_P__lf___1P___-BAAAAU____5X___8p_v__FQAAAGz9__8P_P__-f3__6T7__8_AAAA1P7__xYCAACT_v__AAAAANT-__-H_v__FQAAABT____V____Y____739__-dAAAAfv7__7H___9U____JP___5X___8k____-vv__zT___-V____U____ywBAACNAAAAmAEAAHkBAABJBgAAJP___ywBAAB3_v__gQAAAGP___9q____JP___zz9___G_v__p_3__-H___89_v__aQEAAP_-__-S____Pf7__34AAAAi-v__Bf___zn7__-NAAAAe_z__6L___9l_P__FP___3____9z____AQEAACT___-vAgAAHwAAABgCAABj____wQAAAJv9__8_____AAAAANT-__9n_v__vv7__zT___8o_v__TwAAABL-__9PAAAA0v3__475___L-P__Hf3__436___u_P__Dvv__4f-___9_f__-f3__xT___-2_v__lf___zj-__8S_v__Bf___2j-___l_v__6____zj-__8DAgAAKf7__20BAAAd_f__QAAAAJT7__97_P__7Pn__3n7__9I9___Wub__xT____U_v__lPv__37-__-n8P__j_v___78__8AAAAAq_3___39___Y-v__2AEAAPX-__8XAQAAXgAAAKwAAACvAwAAPf7__ysBAACWAAAA3AAAABgCAADG_v__hAIAAC39__-FAwAAfP3__8MBAADa_f__FQAAAFz9__9-_v__FP___37-__-dAAAAFP___4L___9U____xv7__ysAAABq-v__IPn__yT____S_f__XP3__3z9__8N_f__o_r__x8AAAB-_v__ZQIAAOj9___w____vf3__2P___9T_v__d_7__77-__8S_P__QAAAAAT___9CAQAAY____-4BAADw____ggEAAOn9__-YAQAAyv3__xcBAABw_P__hAIAAJv9___XAAAApv7__1T___9D____fv7__635__9i-v__WP___2kAAADB____ggEAAK8DAACvAgAApAIAABoDAAAvAAAAVwEAACT___9XAQAAY____0AAAAC__P__PP3__14AAAD__v__Q____xT___80____bQEAABT___8p____tv7__37-___5_f__e_z__5D8__8I9___PwAAAHz9__-Y_f__HPj__zj-__-e9___ov___7v8__8_AAAA__7__8wAAADU_v__8P___6b8___p_f__Jv3__-n9__8o_v__2v3__8D___-S____rAAAAF4AAADEAgAARfv__1kCAACL9v__zvr__yH8__9f-P__cv___-v____1_v__rQEAAPX-__-WAAAAKP7__z____9F-___qf7__wT___-T_v__V_7__zn7__-C____z_v___D____U_v__Cf7__8D___9e-f__Ovz__3v9__9_____0_v__0AAAAB0-___qf7__1z9___o_f__Hf3__9_3__-P_P__MPX__0z9___O-v__PP3__2j-__9g_P__wP___7r9___A____GP7__z____9p-v__h_b__6j6__-K-P__Cf7__6n-__93_v__1f___3v9__89_v__-f3__-v____l_v__KwAAAKr9__8_____GP7__2r___97_f__6f7__3D8_____v__OP7__-v____x_f__wQAAAIb-__-CAQAADf3__8MBAACS____mAEAAKn5___gBAAAAgAAAPv___8AAAAAAAAAAA==;XLWSAtsM3QdLBAAAwwEAAP4GAACtAQAAbAcAAIgFAAAQCgAAYggAAMkEAAAaAwAAlQUAACwPAAAk____iBMAAPrz___xIAAAGPv__wEBAADD7v__pe3__4_5__9n_f__Yfz__4n3__8LAQAAYvr__wP8__-Q_P__FgIAACb9__9HBQAAs-j__x8AAADo_f__3AAAAFP-__-NAAAATOv__wEAAAD_____"},{"Name":"Пригород","Color":"#c2bc1b","Coords":"SxOTAnzm3AcYav__nkgCAPAAAABQAAAA7gIAAKkCAAAZAwAAuQIAAMgAAADXAAAApQAAAPEAAACNAAAAVwEAAIkAAADNAQAAcgAAACcBAACCAAAAHAEAAFoAAACmAAAAJwEAAHIBAABWAQAAogEAAPoAAADrAAAApAEAABIBAABaAQAABwEAACcBAADsAAAALgEAAE0BAABxAQAAyAEAAGkBAADTAQAA5QkAAKcPAABhAQAAnwIAAH0BAABgAwAAjQAAAE0BAADrAQAAHwMAAKoEAAAEAwAA0wIAAC8DAAAsBAAALgIAAPcBAAAxBAAAxAUAABYPAAB0AgAAVwEAAFoBAACvAgAAjwMAAC4CAABaAQAALwMAAJQCAAC7CgAAFgIAAK0BAAC4AQAAsAMAAK4DAAANCQAADAQAAN0EAAB0AgAAAwIAADoBAACp_v__WQEAANX____B____KP7__z8AAACp_v__eQEAANX___-4AQAAgQAAAGYFAADdBAAA0gIAAN0EAADcAAAAWgMAAOX-__9cBAAAnQAAAAMCAABvAwAAWgMAAPYBAACwAwAAXgAAAK0BAAA6AQAAVgAAAH0BAAC3AwAAfgAAALMFAADcAAAA2AEAAD8AAAAEAwAAuAEAAAQDAAAWAgAAgQAAANoHAACHBAAAeQEAANX___-TAgAA3gUAAOH___9ZAgAAeQEAAK0BAACYAQAArwIAAFUCAABU____VQIAAKf9__9eAAAAfP3__48DAAB_____vAAAANoCAABeAAAAiv___0v___-6-___EAAAAGr___-1AAAAav___98BAAA0____uwMAAMsAAADtAwAAAwIAAAwEAABdBQAAzQMAAAoHAACTAgAANAYAAFADAABxEgAAVQIAAPoYAAD7AAAAFg8AAND8__9gBwAACv7__1T___8k____rAAAAFkBAADaAgAA7QMAAAoHAAAdBwAAtQYAAFUCAACIBQAAzQMAANoCAACOAwAA__7__1ADAACwAwAAVQIAAIcEAAC8AAAANAYAAET____eBQAAaP7__7ADAACM_f__AwIAAB8AAAAEAwAA5f7__y8DAABj____BwUAAOH___9dBQAAAA0AAKMXAAB-AAAABwUAAPYBAACCAQAAEQMAADIFAACTAgAAAQEAADoBAACp_v__bwMAAC4CAABZAQAALwMAAPsAAAA4CQAARP___zIFAACHMAEAYVj-_xX___8p____AAAAAFP-__-8AAAAFP___1T___89_v__t_7__5X___9Z_v__P____179___O-v__EP3__7f5__9u_f__I_v___v9__-S_f__bv3__739__99_f__Uf3__-v9__-Q_P__bv3__zb5__8a_v__zvr__1T______v__iP7__2r____m_v__6____z39___F-v__p_7__z_____W_v__6P3__2P5__816v__5v7__z3-__-n_v____7__7f-__--_v__Gv7__1H9___G_v__av___539__9AAAAASf7__z____-3_v__qf7__-D8__9O-___g____-j9__8_AAAAqf7__5L___8p____8P___77-__9z____P____0T___9WAAAAsv___xcBAADW_v__6____9v9__8U____vP3__9L9__8q_v__Zfz__9H8___g-P__RP___5D8__8QAAAAH_j__-sAAAAo_v__5v7__77-__-y____Zfz__3P___8U____ov___w36__-8AAAAmvT__2kBAACK-P__SgQAAPr7__-i____P____-b-__9XAQAAGv7__ywBAAD7_f__f____xX___9q____RP___1T___849f__PP3__2j-___9_f__nP3__2X8___G_v__Ofv__xr-___g-P__JP___4_7__8QAAAAW_X__4P___9R_f__0f___-j9__8vAAAAEf3__6L____6-___CwEAAFH9__9E______7__xX___9WAAAAov___-wAAACS____rQEAAAX___9CAQAAKv7__1cBAACC_P__nAQAAEn-__9rAAAABf___1P-___R____lgAAAJ0AAAAsAQAARP___9gBAAAF____AAAAAET___8p____g____8EAAABE____AQEAAGP____sAAAAff3__4EAAADg-f__1f___4j-___BAAAAjf3__9gBAAAP_f__FwEAAPX-___A____kv___2r___-D____gQAAAET____r____wf___xT___9o_v__awAAADT___8p____L_3__xUAAABJ_v__aP7__4j-__-p_v__U____77-___L_f__Kf___zT___8rAAAA9f7__9gBAAB9_f__igYAAET___-eBQAAl_7__0IBAABe_f__QgEAANb-__9rAAAAFf___9cAAAAF____ggEAAJL___8aAwAA8P___0YEAAAk____7AAAAOH___8sAQAAg____0AAAABj____P____5L___9AAAAAjQAAAEIBAAAp_v__LgIAAKb7__9tAQAAaP7__z____8p_v__0v3__9_5__9-_v__t_7__yn____1_v__k_7__2P___9-_v__0f___2f9__9j____VP___3P___9XAQAAPwAAAJkCAADh____bgIAAPX-__8AAAAA4f___9T-__8V____P____yn-__8p____Yvz__9X____g_P__Kf___4v9__8o_v__-vr__2L6__-3_v__Pf7__8_2__8u5f__sv___5L9__8aAQAAqf7__34AAAAp____4f___1H9__-n_v__Ev7__1j-__9_____t_7__3____80____6f7__4f-__9n_f__h_7___T3___h____fP3__34AAAAl_P__nQAAACj-___7AAAAFP___5MCAAC09___EAAAAM76__9-AAAAuPr__z8AAAB8_f__bgAAAD_____HAQAAkv3___D____U_v__NP___9T-__9Y_v__fv7__3j-__89_v__4Pz__wv5__8F____Yvr__-H___-n_f__TgAAAJD8__-tAAAAEv7__wsBAABq____LwAAAOn-__-n_v____7__139__88_f__U_z__-P6__83-P__q_H__0n-__9k-___ff3__w77__9d_f__ZPv__1f7__-v9P__0Pz__zP3__-dAAAAFP___xAAAABT_v__3AAAAH____-0CAAA__7__7wAAACT_v__AAAAAHz9___1_v__qf7__6T1__-CAQAA-v3__-v____1_v__f____yz3___T7___tv7__5L9__8o-___BPT__7L___9n_f__bgAAAOb8___rAAAA6f7__24AAACp_v__xv7__yb9___m_v__lf___xr-__8XAQAA5v7__wAAAACH_v__KP7__xT8___g-P__-v3__876__-7_f__Yfn__wAAAABT_v__-wAAAH7-__-tAAAAKf___7L___-p_v__l_7__3_____l-___Hff__3P____S_f__U____6r___8F____FQAAADT___9T_v__Kf7__077__9J_v__9Pf__1j-__-9_f__Gf7__37-__9i_P__Jfz__wr-___U_v__aP7__2r___-w_P__kv3__-r9__89_v__Sf7__xL-___L_f__5fv__7D8__8P_P__Gf7__1D8__-c_f__dvn__9v9__9k-___1v7__xL-__-s_f__Dfr__x36__-j7P__1v7__3z9__-y____0fz__14AAAC-_v__kv___6n-__8K_v__aP7__wX___9AAAAAOf7__wEBAABI_v__VgAAABX___--_v__xv7__0AAAAAV____FQAAAHP______v__5f7__0AAAABE____av___7D8__9O-___l_7__9X___9t_f__gQAAAEL8___A____6v3__xT___8p_v__0fz__1P___-sAAAAp_7__5YAAABo_v__FP___yP___-HAAAAPv3__ysAAADQ_P____7__8v9__-T_v__SP3__3n9___v____CAAAAA=="},{"Name":"ВостокЦемент","Color":"#e37b7b","Coords":"YLWSAuEM3Qc0BAAAuAEAAJcDAADhAAAAfwMAANcAAABhBwAAeQUAABcKAABnCAAA2QQAACUDAACFBQAALA8AACT___-IEwAA-vP___EgAAAf-___AQEAAMPu__-l7f__h_n__1z9__9Z_P__lPf__wsBAABi-v__C_z__4b8__8OAgAAR_3__08FAACT6P__HwAAAP39___kAAAASP7__4kAAABL6___AQAAAP7___8="}]}';
    
    if (!jsonBase64String)
    {
        alert("У данного завода нет активных зон!");
        return;
    }
	
    jsonString = Base64.decode(jsonBase64String);
	var json = JSON.parse(jsonString);
	
	//Очищаем карту
	var i = 0;
	for (i = 0; i < poligons.length; ++i)
	{
		if (poligons[i] != null)
		{
			map.geoObjects.remove(poligons[i]);
		}
	}
	poligons = new Array();
	
	//Загружаем на карту новые данные
	map.setCenter(json.Center, json.Zoom);
	var loadPoligons = json.Poligons;
	var j = 0;
	var loadPoligon = null;
	for (j = 0; j < loadPoligons.length; ++j)
	{ 
		if (loadPoligons[j].Coords != "")
		{
			loadPoligon = new ymaps.Polygon(ymaps.geometry.Polygon.fromEncodedCoordinates(loadPoligons[j].Coords));
			loadPoligon.properties.set('balloonContent', loadPoligons[j].Name);
			loadPoligon.options.set('fillColor', loadPoligons[j].Color);
			
			//task21501 08.09.2016, GorDS -->
			//loadPoligon.options.set('fillOpacity', 0.2); 					//Закомментировал
			//loadPoligon.options.set('strokeColor', '#0000FF'); 			//Закомментировал
			loadPoligon.options.set('fillOpacity', 0);						//Прозрачна
			loadPoligon.options.set('strokeColor', loadPoligons[i].Color); 	//Цвет границы зоны = цвету зоны
			loadPoligon.options.set('strokeWidth', 0);						//Размер границы зоны
			//task21501 08.09.2016, GorDS <--
			
			map.geoObjects.add(loadPoligon);
			poligons[j] = loadPoligon;
		}
	}

    //GorDS, Передача PoligonId в Hiden field -->
    map.geoObjects.events.add("click", function (event) { 
        var targetPoligon = event.get('target');
        
		/*task21501 Закомментировал 08.09.2016, GorDS -->
        targetPoligon.options.set('strokeWidth', 5); 
        poligonId = targetPoligon.properties.get('balloonContent');
        $("#MainContent_zoneId").val(poligonId); //Сохранение Id зоны для передачи
		task21501 Закомментировал 08.09.2016, GorDS <-- */

        if (targetPoligon != selectPoligon) //Для выделения полигона на карте
        {
			/*task21501 Закомментировал 08.09.2016, GorDS -->
            if (selectPoligon)
            {
                selectPoligon.options.set('strokeWidth', 0.2);
            }
			task21501 Закомментировал 08.09.2016, GorDS <-- */
            selectPoligon = targetPoligon;
        }
    });
	
    if ($("#MainContent_zoneId").val() != '') {
        for (var j = 0; j < poligons.length; j++) {
            if (poligons[j].properties.get('balloonContent') == $("#MainContent_zoneId").val()) {
		//task21501  08.09.2016, GorDS -->
                //poligons[j].events.fire("click"); //Закомментировал
				if ($("#MainContent_unloadAddr").val() != '')
				{
					geocodeAddress($("#MainContent_unloadAddr").val());
				}
				else
				{
					clickOnPoligon(poligons[j]);
				}
		//task21501  08.09.2016, GorDS <--
            }
        }
    }
    //GorDS, Передача PoligonId в Hiden field <--
}  

function clickOnPoligon(clickPoligon) { //task21501 Нажатие на зону 08.09.2016, GorDS
	var poligonId = clickPoligon.properties.get('balloonContent');
	$("#MainContent_zoneId").val(poligonId); //Сохранение Id зоны для передачи

	clickPoligon.events.fire("click"); //Стандартное событие - отображение наименования зоны
}

function collapsElement(id) { //GorDS,  Открытие - закрытие блока
    if (document.getElementById(id).style.display != "none") {
        document.getElementById(id).style.display = 'none';
    }
    else {
        document.getElementById(id).style.display = '';
        OnMapChangeEvent($("#MainContent_zoneString").val()); //Вывод зоны по заводу
    }
}

function getPolygon() {
    OnMapChangeEvent($("#MainContent_zoneString").val()); //Вывод зоны по заводу
}

function showAddress (value) //GorDS, Поиск введенного адреса
{ 
    if (value == "")
        return;

    try
    {
        getLocationByIP(value);
    }
    catch (er)
    {
        getDefaultLocation(value);
    }
}

function getLocationByIP(value) //GorDS, Местоположение пользователя по IP
{
   var userPlace;
   var serchPlace;
    
    ymaps.geolocation.get({
        // Выставляем опцию для определения положения по ip
        provider: 'yandex',
        autoReverseGeocode: true
    }).then(function (result) {
        userPlace = result.geoObjects.get(0).properties.get('text');   
        
        //Если был указан край \ область \ автономный округ \ республика, тогда не использовать геопозицию
        if (value.match(/.*край.*/) || value.match(/.*область.*/) || value.match(/.*автономный округ.*/) || value.match(/.*республика.*/))
        {
            serchPlace = value;
        }
        else
        {
            serchPlace = userPlace + ", " + value;
        }
        
        serchPlaceOnMap(serchPlace);
    });
}

function setSelectPoligon(point) //GorDS, Выбор полигона, в который попадает точка поиска (адрес разгрузки)
{
    var clickOnZone = false;
    /* 10.03.2016, GorDS -->
    poligons.forEach(function(entry) {
        if (entry.geometry.contains(point.geometry.getCoordinates()))
        {
            entry.events.fire("click"); //Эмуляция нажатия на объект
            clickOnZone = true;
        }

        //GorDS, Если не был выбрана зона - очищаем текущую выбранную
        if (!clickOnZone)
        {
            removeSelectedPoligon(true);
        }
    });
    Закомментировал */

    for (i = 0; i < poligons.length; ++i)
    {
		if (poligons[i] != null)
		{
			if (poligons[i].geometry.contains(point.geometry.getCoordinates()))
			{
				//task21501 08.09.2016, GorDS -->
				//poligons[i].events.fire("click"); //Эмуляция нажатия на объект //Закомментировал
				clickOnPoligon(poligons[i]);
				//task21501 08.09.2016, GorDS <--
				clickOnZone = true;
			}
		}
    }

    //Если не был выбрана зона - очищаем текущую выбранную
    if (!clickOnZone)
    {
        removeSelectedPoligon(true);
    }
    // 10.03.2016, GorDS <--
}

function serchPlaceOnMap(serchPlace) //GorDS, Вывод введенного значения на карту
{
    var myGeocoder = ymaps.geocode(serchPlace);
    myGeocoder.then(
        function (res) {
            map.setCenter(res.geoObjects.get(0).geometry.getCoordinates());
            setSelectPoligon(res.geoObjects.get(0));
            //map.setBounds(res.geoObjects.get(0).geometry.getBounds());         
        },
        function (err) {
            alert('Не найден указанный адрес!');
        }
    );

}

function getDefaultLocation(value) //GorDS, Вывод введенного значения на карту во Владивостоке
{
    var userPlace = defaultLocation();
    var serchPlace = userPlace.country + ", " + userPlace.region + ", " + userPlace.city + ", " + value;

    serchPlaceOnMap(serchPlace)
}

function defaultLocation() //GorDS, Владивосток
{
    return {
        latitude: 43.12761611,
        longitude: 131.977039584,
        city: "Владивосток",
        region: "Приморский край",
        country: "Россия",
        zoom: 10
    };
}