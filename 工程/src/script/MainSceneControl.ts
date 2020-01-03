import Enemy from "./Enemy";
import Candy from "./Candy";
export default class MainSceneControl extends Laya.Script {
    /** @prop {name:candy, tips:"糖果", type:Prefab}*/
    public candy: Laya.Prefab;
    /** @prop {name:candyParent, tips:"糖果父节点", type:Node}*/
    public candyParent: Laya.Sprite;
    /** @prop {name:candyParent_Move, tips:"克隆糖果用来移动的父节点", type:Node}*/
    public candyParent_Move: Laya.Sprite;

    /** @prop {name:roleParent, tips:"角色父节点", type:Node}*/
    public roleParent: Laya.Sprite;

    /** @prop {name:enemy, tips:"敌人", type:Prefab}*/
    public enemy: Laya.Prefab;
    /** @prop {name:enemyParent, tips:"敌人父节点", type:Node}*/
    public enemyParent: Laya.Sprite;
    /** @prop {name:enemyBullet, tips:"敌人子弹预制体", type:Prefab}*/
    public enemyBullet: Laya.Prefab;

    /** @prop {name:background, tips:"背景图", type:Node}*/
    public background: Laya.Sprite;
    /** @prop {name:assembly, tips:流水线, type:Node}*/
    public assembly: Laya.Sprite;

    /** @prop {name:speakBoxParent, tips:"对话框父节点", type:Node}*/
    public speakBoxParent: Laya.Sprite;
    /** @prop {name:speakBox, tips:"对话框", type:Prefab}*/
    public speakBox: Laya.Prefab;

    /** @prop {name:bulletParent, tips:"子弹父节点", type:Node}*/
    public bulletParent: Laya.Sprite;
    /** @prop {name:roleBullet, tips:"子弹", type:Prefab}*/
    public roleBullet: Laya.Prefab;

    /** @prop {name:scoreLabel, tips:‘得分’, type:Node}*/
    public scoreLabel: Laya.Label;

    /** @prop {name:hintWord , tips:"属性飘字提示", type:Prefab}*/
    public hintWord: Laya.Prefab;

    /** @prop {name:timer , tips:"计时器", type:Node}*/
    public timer: Laya.Sprite;

    /**是否处于暂停状态*/
    private suspend: boolean;

    /**两个主角*/
    private role_01: Laya.Sprite;
    private role_02: Laya.Sprite;

    /**两个主角的对话框*/
    private role_01speak: Laya.Sprite;
    private role_02speak: Laya.Sprite;

    /**敌人出现开关，这个开关每次开启后，一次性，赋一次值只能产生一个敌人*/
    private enemyAppear: boolean;
    /**怪物攻击对象,也是上个吃糖果对象,一次性，赋一次值只能用一次*/
    private enemyTagRole: Laya.Sprite;
    /**敌人产生的总个数记录*/
    private enemyCount: number;

    /**糖果产生的时间间隔*/
    private candy_interval: number;
    /**当前时间记录*/
    private creatTime: number;
    /**生产开关*/
    private creatOnOff: boolean;
    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameArr: Array<string>;
    /**糖果生产的总个数记录*/
    private candyCount: number;
    /**复活所需吃糖果的数量*/
    private rescueNum: number;

    /**时间线*/
    private timerControl: number;

    /**怪物属性*/
    private enemyProperty: any;

    /**左边出怪的时间间隔*/
    private enemyInterval_01: number;
    /**左边每次出怪时间控制*/
    private enemyTime_01: number;
    /**左边出怪开关*/
    private enemySwitch_01: boolean;

    /**右边出怪的时间间隔*/
    private enemyInterval_02: number;
    /**右边每次出怪时间控制*/
    private enemyTime_02: number;
    /**左边出怪开关*/
    private enemySwitch_02: boolean;

    /**10个糖果固定位置*/
    private posArr_left: Array<Array<number>>;
    private posArr_right: Array<Array<number>>;
    /**每次创建10个糖果他们的名称组合*/
    private candyNameArr: Array<string>;

    constructor() { super(); }

    onEnable(): void {
        this.initSecne();
        this.roletInit();
        this.roleSpeakBoxs();
        this.candyPosInit();
        this.createWaveCandys();
    }

    /**场景初始化*/
    initSecne(): void {
        this.enemyAppear = false;
        this.enemyTagRole = null;
        this.enemyCount = 0;

        // 初始化怪物属性，依次为血量，
        this.enemyProperty = {
            blood: 200,
            attackValue: 15,
            attackSpeed: 100,
            defense: 10,
            moveSpeed: 10,
            creatInterval: 5000
        }

        this.enemyInterval_01 = 500;
        this.enemyTime_01 = Date.now();
        this.enemySwitch_01 = true;

        this.enemyInterval_02 = 500;
        this.enemyTime_02 = Date.now();
        this.enemySwitch_02 = true;

        this.candy_interval = 1000;
        this.creatTime = Date.now();
        this.creatOnOff = true;
        this.nameArr = [];
        this.candyCount = 0;
        this.scoreLabel.text = '0';

        this.rescueNum = 0;
        // 关闭多点触控
        Laya.MouseManager.multiTouchEnabled = false;
        this.timerControl = 0;

        this.owner['MainSceneControl'] = this;//脚本赋值

        this.suspend = false;
    }

    /**生成10个初始糖果
     * 在固定的10个位置*/
    candyPosInit(): void {
        this.posArr_left = [];
        this.posArr_right = [];
        let candyHeiht = 100;
        let spacing = 10;
        let startX_01 = Laya.stage.width / 2 - 70;
        let startX_02 = Laya.stage.width / 2 + 70;
        let startY = Laya.stage.width / 3;
        // 注意排布顺序，把第一个排到最前，所以返回来循环
        for (let i = 1; i >= 0; i--) {
            for (let j = 4; j >= 0; j--) {
                if (i === 0) {
                    let arr = [startX_01, startY + j * (candyHeiht + spacing)];
                    this.posArr_left.push(arr);
                } else if (i === 1) {
                    let arr = [startX_02, startY + j * (candyHeiht + spacing)];
                    this.posArr_right.push(arr);
                }
            }
        }
    }

    /**10个糖果排布动画*/
    createWaveCandys(): void {
        // 生成10个初始糖果
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 5; j++) {
                let x;
                let y;
                let candy = this.createCandy();
                if (i === 0) {
                    x = this.posArr_left[j][0];
                    y = this.posArr_left[j][1];
                } else if (i === 1) {
                    x = this.posArr_right[j][0];
                    y = this.posArr_right[j][1];
                }
                candy.x = x;
                candy.y = y;
                candy['Candy'].group = j;
            }
        }
    }

    /**主角初始化，成对出现在两个固定位置，每次初始化后的位置可能会调换*/
    roletInit(): void {
        this.role_01 = this.owner.scene.role_01;
        this.role_02 = this.owner.scene.role_02;
        let pic_01 = (this.role_01.getChildByName('pic') as Laya.Sprite);
        let pic_02 = (this.role_02.getChildByName('pic') as Laya.Sprite);

        // 随机更换皮肤
        let imageUrl_01: string = 'candy/红色桶.png';
        let imageUrl_02: string = 'candy/黄色桶.png';
        let randomNum = Math.floor(Math.random() * 2);
        if (randomNum === 0) {
            pic_01.loadImage(imageUrl_01);
            pic_01.name = 'redRole';
            pic_02.loadImage(imageUrl_02);
            pic_02.name = 'yellowRole';

        } else {
            pic_02.loadImage(imageUrl_01);
            pic_02.name = 'redRole';
            pic_01.loadImage(imageUrl_02);
            pic_01.name = 'yellowRole';
        }
    }

    /**两个主角对话框的初始化*/
    roleSpeakBoxs(): void {
        for (let i = 0; i < 2; i++) {
            let speakBox = Laya.Pool.getItemByCreateFun('speakBox', this.speakBox.create, this.speakBox) as Laya.Sprite;
            this.speakBoxParent.addChild(speakBox);
            if (i === 0) {
                speakBox.pos(this.role_01.x, this.role_01.y);
                this.role_01speak = speakBox;
                this.role_01speak.alpha = 0;
                // 反向和偏移
                let pic = this.role_01speak.getChildByName('pic') as Laya.Sprite;
                let label = this.role_01speak.getChildByName('label') as Laya.Sprite;
                pic.scaleX = -1;
                label.x += 30;
            } else {
                speakBox.pos(this.role_02.x, this.role_02.y);
                this.role_02speak = speakBox;
                this.role_02speak.alpha = 0;
            }
        }
    }

    /**产生糖果*/
    createCandy(): Laya.Sprite {
        // 通过对象池创建
        let candy = Laya.Pool.getItemByCreateFun('candy', this.candy.create, this.candy) as Laya.Sprite;
        // 随机创建一种颜色糖果
        // 糖果的名称结构是11位字符串加上索引值，方便查找，并且这样使他们的名称唯一
        let randomNum = Math.floor(Math.random() * 4);
        let url_01 = 'candy/黄色糖果.png';
        let url_02 = 'candy/红色糖果.png';
        let url_03 = 'candy/蓝色糖果.png';
        let url_04 = 'candy/绿色糖果.png';
        let pic = (candy.getChildByName('pic') as Laya.Sprite);
        switch (randomNum) {
            case 0:
                candy.name = 'yellowCandy' + this.candyCount;
                pic.loadImage(url_01);
                break;
            case 1:
                candy.name = 'redCandy___' + this.candyCount;
                pic.loadImage(url_02);
                break;
            case 2:
                candy.name = 'blueCandy__' + this.candyCount;
                pic.loadImage(url_03);
                break;
            case 3:
                candy.name = 'greenCandy_' + this.candyCount;
                pic.loadImage(url_04);
                break;
            default:
                break;
        }
        // 随机点击次数
        let clicksLabel = candy.getChildByName('clicksLabel') as Laya.Label;
        clicksLabel.text = (Math.floor(Math.random() * 0) + 1).toString();
        candy.pos(Laya.stage.width / 2, -100);
        this.candyParent.addChild(candy);
        candy.rotation = 0;
        this.candyCount++;
        return candy;
    }

    /**角色死亡复活状况*/
    roleDeathState(): void {
        // 角色死亡情况
        let len = this.roleParent._children.length;
        if (len === 0) {
            // 死亡
            this.enemySwitch_01 = false;
            this.enemySwitch_02 = false;

            return;
        } else if (len === 1) {
            let speak_01 = this.role_01speak.getChildByName('label') as Laya.Label;
            let speak_02 = this.role_02speak.getChildByName('label') as Laya.Label;
            // 复活
            if (this.rescueNum >= 5) {
                this.rescueNum = 0;
                if (this.roleParent._children[0].name === "role_01") {
                    this.roleParent.addChild(this.role_02);
                    this.role_02speak.x -= 150;
                    speak_02.text = '谢谢你啊！';
                } else {
                    this.roleParent.addChild(this.role_01);
                    speak_01.text = '谢谢你啊！';
                    this.role_01speak.x += 150;
                }
            } else {
                // 待复活提示
                if (this.roleParent._children[0].name === "role_01") {
                    this.role_02speak.alpha = 1;
                    this.role_02speak.x = this.role_02.x;
                    speak_02.text = '连续吃5个糖果不犯错的话我就复活了';
                } else {
                    this.role_01speak.alpha = 1;
                    this.role_01speak.x = this.role_01.x;
                    speak_01.text = '连续吃5个糖果不犯错的话我就复活了';
                }
            }
        } else if (len === 2) {
            // 保持，复活状态为空
            this.rescueNum === 0;
        }
    }

    /**出现敌人
     * 创建方式决定了敌人出生的位置
     * @param mode 创建模式是左边还是右边
     * @param tagRole 目标是哪个主角
    */
    careatEnemy(mode: string, tagRole: Laya.Sprite, type: string): Laya.Sprite {
        this.enemyCount++;
        if (tagRole !== null) {
            let enemy = Laya.Pool.getItemByCreateFun('enemy', this.enemy.create, this.enemy) as Laya.Sprite;
            this.enemyParent.addChild(enemy);
            enemy.name = 'enemy' + this.enemyCount;//名称唯一
            enemy.pivotX = enemy.width / 2;
            enemy.pivotY = enemy.height / 2;
            //出生位置判定,和攻击目标选择
            if (mode === 'left') {
                enemy.pos(-50, 300);
            } else if (mode === 'right') {
                enemy.pos(800, 300);
            } else if (mode === 'target') {
                if (tagRole.x < Laya.stage.width / 2 && tagRole.x > 0) {
                    enemy.pos(-50, 300);
                } else if (tagRole.x >= Laya.stage.width / 2 && tagRole.x < Laya.stage.width) {
                    enemy.pos(800, 300);
                }
            }
            enemy['Enemy'].slefTagRole = tagRole;
            enemy['Enemy'].enemyType = type;
            enemy['Enemy'].randomAttackPoint();
            // 皮肤

            let newPic = new Laya.Sprite;
            let url_01 = 'candy/近战敌人.png'
            let url_02 = 'candy/远程敌人.png'
            if (type === 'infighting') {
                newPic.loadImage(url_01);
            } else if (type === 'range') {
                newPic.loadImage(url_02);
            }
            enemy.addChild(newPic);
            newPic.pivotX = newPic.width / 2;
            newPic.pivotY = newPic.height / 2;
            newPic.pos(enemy.width / 2, enemy.height / 2);

            let originalPic = enemy.getChildByName('pic') as Laya.Sprite;
            originalPic.removeSelf();
            // 默认属性不可见
            let propertyShow = enemy.getChildByName('propertyShow') as Laya.Sprite;
            if (!this.suspend) {
                propertyShow.alpha = 0;
            } else {
                propertyShow.alpha = 1;
            }
            return enemy;
        }
    }
    /** 敌人的层级进行排序
   * 规则是判断y轴，y坐标越低的越靠前
  */
    enemyOrder(): void {
        for (let i = 0; i < this.enemyParent._children.length; i++) {
            this.enemyParent._children[i].zOrder = Math.round(this.enemyParent._children[i].y);
        }
    }
    /**属性刷新显示规则,血量显示一定是整数，并且是10的倍数
    * 根据时间线的增长，怪物的属性不断增强
    */
    enemyPropertyUpdate(): void {
        if (this.timerControl % 500 === 0) {
            // 血量增长
            this.enemyProperty.blood += 50;
            // 攻击力增长
            this.enemyProperty.attackValue += 1;
            // 防御力增长
            this.enemyProperty.defense += 1;
            // 出怪时间增长,这里会有个最短间隔
            if (this.enemyProperty.creatInterval > 500) {
                this.enemyProperty.creatInterval -= 1;
            }
        }

    }


    /**属性刷新显示规则*/
    onUpdate(): void {
        // 时刻对敌人的层级进行排序
        this.enemyOrder();
        // 记录时间
        this.timerControl += 1;
        // 根据时间线，刷新怪物属性
        this.enemyPropertyUpdate();
        // 角色死亡复活状况
        this.roleDeathState();
        // 通过时间间隔产生敌人，左右产生的敌人不一样
        // 左
        if (this.enemySwitch_01) {
            let nowTime = Date.now();
            if (nowTime - this.enemyTime_01 > this.enemyProperty.creatInterval) {
                this.enemyTime_01 = nowTime;
                this.enemyTagRole = this.role_01;
                this.careatEnemy('left', this.role_01, 'infighting');
                this.enemyTagRole = null;
            }
        }
        // 右
        if (this.enemySwitch_02) {
            let nowTime = Date.now();
            if (nowTime - this.enemyTime_02 > this.enemyProperty.creatInterval) {
                this.enemyTime_02 = nowTime;
                this.enemyTagRole = this.role_02;
                this.careatEnemy('right', this.role_02, 'infighting');
                this.enemyTagRole = null;
            }
        }
    }

    onDisable(): void {
    }
}