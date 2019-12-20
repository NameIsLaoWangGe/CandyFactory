import Candy from "./Candy";

export default class MainSceneControl extends Laya.Script {
    /** @prop {name:candy, tips:"糖果", type:Prefab}*/
    public candy: Laya.Prefab;
    /** @prop {name:candyParent, tips:"糖果父节点", type:Node}*/
    public candyParent: Laya.Sprite;

    // /** @prop {name:bucket, tips:"盒子", type:Prefab}*/
    // public bucket: Laya.Prefab;
    // /** @prop {name:bucketParent, tips:"第一个", type:Node}*/
    // public bucketParent: Laya.Sprite;

    /** @prop {name:enemy, tips:"敌人", type:Prefab}*/
    public enemy: Laya.Prefab;
    /** @prop {name:enemyParent, tips:"敌人父节点", type:Node}*/
    public enemyParent: Laya.Sprite;


    /** @prop {name:background, tips:"背景图", type:Node}*/
    public background: Laya.Sprite;
    /** @prop {name:assembly, tips:流水线, type:Node}*/
    public assembly: Laya.Sprite;

    /** @prop {name:scoreLabel, tips:‘得分’, type:Node}*/
    public scoreLabel: Laya.Label;

    /**两个主角*/
    private role_01: Laya.Sprite;
    private role_02: Laya.Sprite;

    /**敌人出现开关，这个开关每次开启后，立马会被关闭，因为每次只出现一个敌人*/
    private enemyAppear: boolean;
    /**怪物攻击对象,也是上个吃糖果对象*/
    private targetRole: Laya.Sprite;

    /**糖果产生的时间间隔*/
    private candy_interval: number;
    /**当前时间记录*/
    private creatTime: number;
    /**生产开关*/
    private creatOnOff: boolean;
    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameAndIndex: Array<string>;
    /**生成糖果个数计数器*/
    private candyCount: number;

    constructor() { super(); }

    onEnable(): void {
        this.initSecne();
    }

    /**场景初始化*/
    initSecne(): void {
        this.enemyAppear = false;
        this.targetRole = null;

        this.candy_interval = 500;
        this.creatTime = Date.now();
        this.creatOnOff = true;
        Laya.MouseManager.multiTouchEnabled = true;
        this.nameAndIndex = [];
        this.candyCount = 0;
        this.scoreLabel.text = '0';
        this.protagonistInit();
    }

    /**主角初始化，成对出现在两个固定位置，每次初始化后的位置可能会调换*/
    protagonistInit(): void {
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

    /**产生糖果*/
    productionCandy(): void {
        let candy = Laya.Pool.getItemByCreateFun('candy', this.candy.create, this.candy) as Laya.Sprite;
        this.candyCount++;

        // 随机创建一种颜色糖果
        // 糖果的名称结构是11位字符串加上索引值，这样使他们的名称唯一
        let randomNum = Math.floor(Math.random() * 2);
        let url_01 = 'candy/黄色糖果.png';
        let url_02 = 'candy/红色糖果.png';
        switch (randomNum) {
            case 0:
                candy.name = 'yellowCandy' + this.candyCount;
                (candy.getChildByName('pic') as Laya.Sprite).loadImage(url_01);
                break;
            case 1:
                candy.name = 'redCandy___' + this.candyCount;
                (candy.getChildByName('pic') as Laya.Sprite).loadImage(url_02);
                break;
            default:
                break;
        }
        candy.pos(Laya.stage.width / 2 - candy.width / 2, -100);
        this.candyParent.addChild(candy);
        candy.rotation = 0;
    }

    /**出现敌人*/
    careatEnemy() {
        let enemy = Laya.Pool.getItemByCreateFun('enemy', this.enemy.create, this.enemy) as Laya.Sprite;
        this.enemyParent.addChild(enemy);
        enemy.pos(0, 0);
    }

    onUpdate(): void {
        if (this.creatOnOff) {
            let nowTime = Date.now();
            if (nowTime - this.creatTime > this.candy_interval) {
                this.creatTime = nowTime;
                this.productionCandy();
            }
        }
        if (this.enemyAppear) {
            console.log('出现一个敌人');
            this.enemyAppear = false;
            this.targetRole = null;
            this.careatEnemy();
        }
    }

    onDisable(): void {

    }
}