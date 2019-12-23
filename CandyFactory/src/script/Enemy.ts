import MainSceneControl from "./MainSceneControl";

export default class Enemy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**自己的血量*/
    private selfHealth: Laya.ProgressBar;
    /**自己移动速度*/
    private slefSpeed: number;

    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;

    /**主角的父节点*/
    private roleParent: Laya.Sprite;
    /**怪物攻击对象,也是上个吃糖果对象,一次性，赋一次值只能用一次*/
    private tagRole: Laya.Sprite;
    /**攻击对象血量*/
    private tagHealth: Laya.ProgressBar;

    /**对话框*/
    private speakBox: Laya.Prefab;

    /**攻击时间间隔*/
    private attackTnterval: number;
    /**当前时间，用于对比时间间隔*/
    private recordTime: number;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfHealth = this.self.getChildByName('health') as Laya.ProgressBar;
        this.selfHealth.value = 1;
        this.slefSpeed = 5;

        this.selfScene = this.owner.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
        this.roleParent = this.mainSceneControl.roleParent;
        this.tagRole = this.mainSceneControl.tagRole;
        this.tagHealth = this.tagRole.getChildByName('health') as Laya.ProgressBar;

        this.attackTnterval = 1000;
        this.recordTime = Date.now();

        this.speakBox = this.mainSceneControl.speakBox;

        this.bucketClink();
    }

    /**敌人点击事件*/
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**点击敌人，敌人头上会出现小锤子，敲打敌人，每点击一次血量会减少;
     * 如果不把敌人电死，那么主角就会被攻击至死
     * 当然吃到的糖果也会有另外的增益
     * 杀敌暂时不增加分数分数增加*/
    down(event): void {
        // 主角全部死亡时停止移动
        if (this.roleParent._children.length === 0) {
            return;
        } else {
            this.self.scale(0.95, 0.95);
            this.selfHealth.value -= 0.2;
        }
    }
    /**移动*/
    move(event): void {
    }
    /**抬起*/
    up(event): void {
        this.self.scale(1, 1);
    }
    /**出屏幕*/
    out(event): void {
        this.self.scale(1, 1);
    }

    /** 敌人移动规则*/
    enemyMove(): void {
        // x,y分别相减是两点连线向量
        // 向量计算并且归一化，向量长度为1。
        let point = new Laya.Point(this.tagRole.x - this.self.x, this.tagRole.y - this.self.y);
        point.normalize();

        if (this.tagRole.x > Laya.stage.width / 2) {
            if (this.self.x - this.tagRole.x < 100) {
                //向量相加
                this.self.x += point.x * this.slefSpeed;
                this.self.y += point.y * this.slefSpeed;
            } else {
                this.self.x -= this.slefSpeed;
            }
        } else if (this.tagRole.x < Laya.stage.width / 2) {
            if (this.tagRole.x - this.self.x < 100) {
                //向量相加
                this.self.x += point.x * this.slefSpeed;
                this.self.y += point.y * this.slefSpeed;
            } else {
                this.self.x += this.slefSpeed;
            }
        }
    }

    onUpdate(): void {
        // 主角死亡停止移动
        if (this.roleParent._children.length === 0) {
            return;
        }

        // 血量低于0死亡
        if (this.selfHealth.value <= 0) {
            this.self.removeSelf();
        }

        // 超出范围消失
        if (this.self.y > Laya.stage.height + 100 || this.self.y < 0 - 100 || this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // 到达对象位置后开启攻击开关进行攻击，攻击速度依照时间间隔而定
        let differenceX = Math.abs(this.self.x - this.tagRole.x);
        let differenceY = Math.abs(this.self.y - this.tagRole.y);
        if (differenceX < 100 && differenceY < 100) {

            let nowTime = Date.now();
            if (nowTime - this.recordTime > this.attackTnterval) {
                this.recordTime = nowTime;
                // 如果这个攻击对象死了，他会直接走向另一个主角，如果都死了那么就停止
                if (this.tagHealth.value > 0) {
                    this.tagHealth.value -= 0.1;
                } else {
                    // 判断这个目标是不是助手,如果是助手，那么右边主角一定在
                    // 否则如果两个主角都死了，游戏就结束了
                    if (this.tagRole.name === 'friend') {
                        this.tagRole = this.roleParent.getChildByName('role_02') as Laya.Sprite;
                    } else {
                        // 如果这个对象死了，并且旁边的主角还在，那么把旁边的主角赋值给这个tagRole；
                        if (this.tagRole === null) {
                            if (this.roleParent._children[0]) {
                                this.tagRole = this.roleParent._children[0];
                                let tagHealth = this.roleParent._children[0].getChildByName('health');
                                this.tagHealth = tagHealth;
                            }
                        }
                    }
                }
            }
        } else {
            this.enemyMove();
        }

    }

    onDisable(): void {
        Laya.Pool.recover('enemy', this.self);
    }


}