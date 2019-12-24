import MainSceneControl from "./MainSceneControl";
import Candy from "./Candy";
export default class Role extends Laya.Script {
    /** @prop {name:bulletParent, tips:"子弹父节点", type:Node}*/
    public bulletParent: Laya.Sprite;
    /** @prop {name:bullet, tips:"子弹", type:Prefab}*/
    public bullet: Laya.Prefab;

    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;
    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameArr: Array<string>;
    /**糖果父节点*/
    private candyParent: Laya.Sprite;
    /**自己的血量*/
    private selfHealth: Laya.ProgressBar;

    /**主角属性*/
    private role_01_P: object;
    private role_02_P: object;

    /**敌人预警，只要敌人进入射程就会触发警报*/
    private role_Warning: boolean;
    /**两个子弹创建时间间隔*/
    private interval_bullt: number;
    /**两个当前创建时间记录*/
    private nowTime: number;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }
    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
        this.nameArr = this.mainSceneControl.nameArr;
        this.candyParent = this.mainSceneControl.candyParent;
        this.selfHealth = this.self.getChildByName('health') as Laya.ProgressBar;
        this.selfHealth.value = 1;

        this.interval_bullt = 100;
        this.nowTime = Date.now();

        this.role_01_P = {
            blood: 200,
            ATK: 10,
            ATKSpeed: 5,
            DEF: 10,
        };

        this.role_02_P = {
            blood: 200,
            ATK: 10,
            ATKSpeed: 5,
            DEF: 10,
        };

        this.bucketClink();
    }
    /**主角的点击事件*/
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**按下,给予目标位置，糖果走向目标位置;
     * 并且分数增加*/
    down(event): void {
        // 目前点击主角的时候关闭对话框，以免扰乱视线,但是只关闭自己的对话框。
        if (this.self.name === 'role_01') {
            this.mainSceneControl.role_01speak.alpha = 0;
        } else {
            this.mainSceneControl.role_02speak.alpha = 0;
        }
        this.self.scale(0.9, 0.9);
        // 如果感应区有糖果,找到第一个进入感应区的糖果的唯一名称
        if (this.nameArr[0]) {
            let candyName = this.nameArr[this.nameArr.length - 1];
            let candy = this.candyParent.getChildByName(candyName);
            if (!candy) {
                return;
            }
            let CandyScript = candy.getComponent(Candy);
            // 给予目标地点,非空说明点击过了,让场景和这个糖果都知道
            if (CandyScript.candyTagRole === null) {
                CandyScript.candyTagRole = this.self;
            }
        } else {
            console.log('糖果不在感应区，或者点错了');
        }
    }
    /**移动*/
    move(event): void {
    }
    /**抬起*/
    up(): void {
        this.self.scale(1, 1);
    }
    /**出屏幕*/
    out(): void {
        this.self.scale(1, 1);
    }


    /**创建主角子弹
     * 主角1位置的子弹
    */
    careatBullet() {
        let bullet = Laya.Pool.getItemByCreateFun('bullet', this.bullet.create, this.bullet) as Laya.Sprite;
        this.bulletParent.addChild(bullet);
        bullet.pos(this.self.x, this.self.y);
    }

    onUpdate(): void {
        if (this.selfHealth.value <= 0) {
            this.self.removeSelf();
        }

        //创建子弹
        if (this.role_Warning) {
            let nowTime = Date.now();
            if (nowTime - this.nowTime > this.interval_bullt) {
                this.careatBullet();
                this.nowTime = nowTime;
            }
        }
    }
    onDisable(): void {
    }
}