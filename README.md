
# MCordovaConfig

Custom xcode config for  Cordova iOS

## 背景
因Cordova官网参数配置并不能满足所有场景，导致现有项目中大量插件都需要通过hook去修改xcode配置满足特定场景，代码管理非常混乱，想通过一个专属插件去做专业的事，其他插件只要引入这个插件，在自己的plugin.xml中声明对应的配置参数即可。

### 实现思路
通过解析Staging虚拟目录下的config.xml文件，得到自定义配置参数，将配置参数写入xcode。

### 插件引入方式
> 
> 因目前插件实现功能还比较少，后续功能变更快，故先不加在core插件中，后期功能丰富插件稳定了可将依赖移除，直接在core插件中引入js即可。因dependency只能依赖公有库，公司不能创建公有库，故在github上创建。

在core插件中Platform iOS下引入: <br>` <dependency id="com.mysoft.mcordovaconfig" url="https://github.com/fengyang0329/mcordovaconfig.git"/>`;<br>

### 插件自定义配置方式
> 1. 在工程路径下的config.xml的`<platform name="ios">`中写入配置参数,这样在插件被添加的时候会自动写入项目Staging虚拟目录下的config.xml文件；例如： 
```
<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="9.1"/>
```

> 2. 在插件plugin.xml的`<platform name="ios">`中写入配置参数，所有的配置都包含在Cordova官方节点`config-file`中,`target`指向`config.xml`,这样在插件被添加的时候会自动写入项目Staging虚拟目录下的config.xml文件，例如：
>
```
 <config-file parent="/*" target="config.xml">
 	<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="9.1"/>
  </config-file>
```


1. [使用`<custom-preference>`修改build settings](#custom-preference)

2. [使用`custom-config-file`修改项目plist(*-Info.plist、Entitlements-*.plist)](#custom-config-file)

3. [调用示例](#调用示例)


### <a name="custom-preference"></a>使用`<custom-preference>`修改build settings

* 插件当前支持
	* 通过`XCBuildConfiguration`块键去修改`project.pbxproj`文件
	* `xcodefunc`：通过[node-xcode](https://github.com/alunny/node-xcode)提供的接口，目前仅支持`addResourceFile`
	
#### XCBuildConfiguration
* `XCBuildConfiguration `是`<custom-preference>`目前唯一支持的块类型，用于修改`platforms/ios/{PROJECT_NAME}/{PROJECT_NAME}.xcodeproj/project.pbxproj`；

* `<custom-preference>`元素属性`name`必须以`XCBuildConfiguration-`作为前缀；<br>例如： `<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0"/>`

* 如果在`XCBuildConfiguration`块中指定的键值没有存在，则会新增一个

* 如果在`XCBuildConfiguration`块中指定的键值已经存在，则会直接覆盖；

* 当`Build Settings`中键值的value是`Multiple values`这种多选类型时，可通过在`<custom-preference>`元素上添加属性`mode="merge"`，不会直接覆盖，会追加一个新值进末尾；

* 可通过在`<custom-preference>`元素上添加属性`quote`给键值和value添加双引号`""`；键值key=`GCC_NEW_KEY`,value=`10.0`,在 `project.pbxproj`中的表现如下：
	* quote可选值：
		* none :  key 和 value都不会添加双引号；默认为none;<br>表现为：`GCC_NEW_KEY = 10.0`
		* key : 只对key添加双引号；<br>表现为：`"GCC_NEW_KEY" = 10.0`
		* value : 只对value添加双引号；<br>表现为：`GCC_NEW_KEY = "10.0"`
		* both : key和value都添加双引号；<br>表现为：`"GCC_NEW_KEY" = "10.0"`

* 默认，会同时作用于`debug`与`release`构建模式，可通过`<custom-preference>`元素属性`buildType`指定构建模式；例如：
	* `<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" buildType="release" />`

#### .xcconfig 

* Cordova 通过`/platforms/ios/cordova/`目录下的`.xcconfig`文件覆盖Xcode项目`project.pbxproj`里的设置；
	* `build.xcconfig`里的设置会在对应的构建模式下被`build-debug.xcconfig`和 `build-release.xcconfig`里的配置覆盖；

* 如果`buildType`为`"debug"`或者`"realease"`,插件将分别在`build-debug.xcconfig`或`build-release.xcconfig`查找；

* 如果`buildType`没有指定，或设置成`none`,插件将会在`build.xcconfig`中查找对应配置参数；

* 如果在对应的`.xcconfig`文件中找到了与Staging虚拟目录下`config.xml`中`<custom-preference>`属性`name`对应的键值，其value将会被属性`name`里的`value`替代；

* 如果`<custom-preference>`属性`name`键值在对应的`.xcconfig`文件中没有找到，可通过`xcconfigEnforce="true"`元素进行新增；

* 当`.xcconfig`中键值的value是`Multiple values`这种多选类型时，可通过在`<custom-preference>`元素上添加属性`mode="merge"`，不会直接覆盖，会追加一个新值进末尾；
	* 例如：`GCC_PREPROCESSOR_DEFINITIONS = DEBUG=1`
	* 追加`value="DEFINITIONS_TEST"`后变成：`GCC_PREPROCESSOR_DEFINITIONS = DEBUG=1 DEFINITIONS_TES`


#### xcodefunc

* 目前仅支持`addResourceFile `，后续会根据需要丰富更多的功能；

* 函数参数应该使用<arg />子元素指定。它支持以下属性:
	* value :  文件或者文件目录路径，文件后缀名仅支持`.jpg .png`,如：`resource/ios/appicon/image.png` or `resource/ios/appicon`
	* type : 类型，目前仅支持`appIcon`:将图片添加进项目并引用的同时，将图片名写入`info.plist.CFBundleIcons`中，可直接调用图片名动态设置App角标.


### <a name="custom-config-file"></a>使用`<custom-config-file>`plist(*-Info.plist、Entitlements-*.plist)

调用示例:

```
<custom-config-file parent="com.apple.developer.associated-domains" split="," target="Entitlements-Debug.plist">
    <array>
        <string>debug_domains</string>
    </array>
</custom-config-file>
<custom-config-file parent="com.apple.developer.associated-domains" split="," target="Entitlements-Release.plist">
    <array>
        <string>release_domains</string>
    </array>
</custom-config-file>
<custom-config-file parent="appKey" target="*-Info.plist">
    <string>123</string>
</custom-config-file>
<custom-config-file parent="CFBundleURLTypes" target="*-Info.plist">
    <array>
        <dict>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>CFBundleURLName</key>
            <string>MCustomUri</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>test</string>
            </array>
        </dict>
    </array>
</custom-config-file>

```


#### <a name="调用示例"></a>调用示例

plugin.xml

```

<config-file parent="/*" target="config.xml">
    <custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0"  />
</config-file>

<config-file parent="/*" target="config.xml">
    
    <custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" buildType="release" />
   
    <custom-preference name="XCBuildConfiguration-GCC_PREPROCESSOR_DEFINITIONS" value="DEFINITIONS_TES" buildType="debug" mode="merge" xcconfigEnforce="true" />
   
   //resource目录与platforms同级，将resource/ios/appicon文件夹里所有图片添加进工程并添加引用
    <custom-preference func="addResourceFile" name="xcodefunc">
        <arg value="resource/ios/appicon" />
    </custom-preference>

    //resource目录与platforms同级，将resource/ios/appicon/image.png图片添加进工程并添加引用
    <custom-preference func="addResourceFile" name="xcodefunc">
        <arg value="resource/ios/appicon/image.png" />
    </custom-preference>

    <custom-preference func="addResourceFile" name="xcodefunc">
        <arg type="appIcon" value="resource/ios/appicon" or value="resource/ios/appicon" />
    </custom-preference>
</config-file>

```

config.xml

```
<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" />

<custom-preference name="XCBuildConfiguration-GCC_PREPROCESSOR_DEFINITIONS" value="DEFINITIONS_TES" buildType="debug" mode="merge" quote="value" />

//resource目录与platforms同级，将resource/ios/appicon文件夹里所有图片添加进工程并添加引用
<custom-preference func="addResourceFile" name="xcodefunc">
    <arg value="resource/ios/appicon" />
</custom-preference>

//resource目录与platforms同级，将resource/ios/appicon/image.png图片添加进工程并添加引用
<custom-preference func="addResourceFile" name="xcodefunc">
    <arg value="resource/ios/appicon/image.png" />
</custom-preference>

<custom-preference func="addResourceFile" name="xcodefunc">
    <arg type="appIcon" value="resource/ios/appicon" or value="resource/ios/appicon" />
</custom-preference>

```
