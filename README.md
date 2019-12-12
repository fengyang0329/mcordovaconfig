
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
<custom-pods name="SAMKeychain" spec="~>1.5.3"/>
```

> 2. 在插件plugin.xml的`<platform name="ios">`中写入配置参数，所有的配置都包含在Cordova官方节点`config-file`中,`target`指向`config.xml`,这样在插件被添加的时候会自动写入项目Staging虚拟目录下的config.xml文件，例如：
>
```
 <config-file parent="/*" target="config.xml">
 	 //<custom-pods name="SAMKeychain" spec="~>1.5.3"/>
  </config-file>
```

1. [使用`<custom-preference>`修改build settings](#custom-preference)
2. 使用`<custom-pods>`去引用Cocoapods管理库
2. [使用`custom-config-file`修改项目plist(*-Info.plist)](#)
3. 使用`<custom-resource>`去引入图片资源
4. [调用示例](#调用示例)


### <a name="custom-preference"></a>使用`<custom-preference>`修改build settings

* 插件当前支持
	* 通过`XCBuildConfiguration`块键去修改`project.pbxproj`文件
	* `xcodefunc`是[node-xcode](https://github.com/alunny/node-xcode)提供的接口
	
#### XCBuildConfiguration
* `XCBuildConfiguration `是`<custom-preference>`目前唯一支持的块类型，用于修改`platforms/ios/{PROJECT_NAME}/{PROJECT_NAME}.xcodeproj/project.pbxproj`

* 如果在`XCBuildConfiguration`块中指定的键值没有存在，则会新增一个

* 如果在`XCBuildConfiguration`块中指定的键值已经存在，如果value是数组，则会追加进数组，否则直接覆盖；

* 默认，value会同时作用于`Debug`与`Release`模式，可通过`buildType`去指定模式；例如：
	* `<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" buildType="release" />`
	* 解析后在`project.pbxproj`文件中表现为：`"IPHONEOS_DEPLOYMENT_TARGET" = "7.0"`



#### <a name="调用示例"></a>调用示例

config.xml

```
<custom-pods name="SAMKeychain" spec="~>1.5.3"/>
<custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" buildType="release" />

```

plugin.xml

```
<config-file parent="/*" target="config.xml">
 	 <custom-pods name="SAMKeychain" spec="~>1.5.3"/>
</config-file>

<config-file parent="/*" target="config.xml">
 	 <custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" buildType="release" />
</config-file>

<config-file parent="/*" target="config.xml">
 	 <custom-pods name="SAMKeychain" spec="~>1.5.3"/>
 	 <custom-preference name="XCBuildConfiguration-IPHONEOS_DEPLOYMENT_TARGET" value="7.0" buildType="release" />
</config-file>

```