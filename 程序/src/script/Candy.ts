import MainSceneControl from "./MainSceneControl";
export default class Candy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;
    /**糖果运行的速度*/
    private selfSpeed: number;
    /**糖果移动对象*/
    private candyTagRole: Laya.Sprite;
    /**主角的父节点*/
    private roleParent: Laya.Sprite;
    /**得分显示*/
    private scoreLabel: Laya.Label;
    /**时间线*/
    private timerControl: number;
    /**标记一下这是第几个糖果*/
    private tab: number;
    /**每个糖果之间的间距*/
    private spaceY: number;

    /**初始化的10个糖果的位置记录*/
    private posYArr: Array<number>;
    /**属性飘字提示*/
    private hintWord: Laya.Prefab;

    /**控制这个糖果是否变成敌人*/
    private becomeEnemy: boolean;
    /**是否向下移动一格*/
    private moveAStep: boolean;

    constructor() { super(); }
    onEnable(): void {
        this.initProperty();
        this.locationInit();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        this.candyTagRole = null;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.roleParent = this.mainSceneControl.roleParent;
        this.scoreLabel = this.mainSceneControl.scoreLabel;
        this.selfSpeed = 6;

        this.tab = this.mainSceneControl.candyCount;
        this.timerControl = 0;

        this.spaceY = 5;

        this.hintWord = this.mainSceneControl.hintWord;

        this.becomeEnemy = false;

        this.moveAStep;

        this.self['Candy'] = this;
    }

    /**初始位置初始化*/
    locationInit(): void {
        this.posYArr = [];
        this.moveAStep = false;
        this.self.y = - this.tab * (this.self.height + this.spaceY);
        for (let i = 0; i < 10; i++) {
            let y = -(this.self.height + this.spaceY) * i;
            this.posYArr.push(y);
        }
    }

    /**当第一个糖果被吃掉后的移动函数
     * 移动速度要非常快
    */
    moveRules(): void {
        Laya.Tween.to(this.self, { y: this.self.y + this.self.height + this.spaceY }, 10, null, Laya.Handler.create(this, function () {
        }, []), 0);
    }

    /**跳到地上变成一个敌人*/
    candybecomeEnemy(): void {
        Laya.Tween.to(this.self, { x: this.self.x + 200 }, 50, null, Laya.Handler.create(this, function () {
        }, []), 0);
    }

    /**飞到主角身上增加主角属性
     * 并且播放属性增加动画
    */
    flyToRole(): void {
        if (this.candyTagRole !== null) {
            // x,y分别相减是两点连线向量
            // 向量计算并且归一化，向量长度为1。
            let point = new Laya.Point(this.candyTagRole.x - this.self.x, this.candyTagRole.y - this.self.y);
            point.normalize();
            //向量相加移动
            this.self.x += point.x * this.selfSpeed;
            this.self.y += point.y * this.selfSpeed;
            // 到达对象位置后开启攻击开关进行攻击，攻击速度依照时间间隔而定
            // 此时移动速度为零
            let differenceX = Math.abs(this.self.x - this.candyTagRole.x);
            let differenceY = Math.abs(this.self.y - this.candyTagRole.y);
            if (differenceX < 50 && differenceY < 50) {
                this.self.removeSelf();
                this.hintWordMove();
                this.roleAddProperty();
                this.candyTagRole = null;
            }
        }
    }

    /**属性增加提示动画*/
    hintWordMove(): void {
        for (let i = 0; i < 2; i++) {
            let hintWord = Laya.Pool.getItemByCreateFun('candy', this.hintWord.create, this.hintWord) as Laya.Sprite;
            let role_01 = this.mainSceneControl.role_01 as Laya.Sprite;
            let role_02 = this.mainSceneControl.role_02 as Laya.Sprite;
            if (i === 0) {
                if (role_01.parent === null) {
                    this.self.removeSelf();
                    return;
                }
                role_01.addChild(hintWord);
            } else {
                if (role_02.parent === null) {
                    this.self.removeSelf();
                    return;
                }
                role_02.addChild(hintWord);
            }
            hintWord.pos(0, -150);
            let proPertyType: string;
            let numberValue: number;
            switch (this.self.name) {
                case 'yellowCandy':
                    proPertyType = '攻击里';
                    numberValue = 10;
                    break;
                case 'redCandy___':
                    proPertyType = '生命';
                    numberValue = 5;
                    break;
                case 'blueCandy__':
                    proPertyType = '公鸡速度';
                    numberValue = 10;
                    break;
                case 'greenCandy_':
                    proPertyType = '防御力';
                    numberValue = 5;
                    break;
                default:
            }

            hintWord['HintWord'].initProperty(proPertyType, numberValue);
        }
    }

    /**根据糖果的种类增加主角属性规则
     * 并且播放增加属性文字提示动画
    */
    roleAddProperty(): void {
        let role_01 = this.mainSceneControl.role_01;
        let role_02 = this.mainSceneControl.role_02;
        switch (this.self.name) {
            case 'yellowCandy':
                if (this.candyTagRole === role_01) {
                    role_01['Role'].role_property.attackValue += 10;
                } else {
                    role_02['Role'].role_property.attackValue += 10;
                }
                break;
            case 'redCandy___':
                if (this.candyTagRole === role_01) {
                    role_01['Role'].role_property.blood += 5;
                } else {
                    role_02['Role'].role_property.blood += 5;
                }

                break;
            case 'blueCandy__':
                if (this.candyTagRole === role_01) {
                    role_01['Role'].role_property.attackSpeed += 10;
                } else {
                    role_02['Role'].role_property.attackSpeed += 10;
                }
                break;
            case 'greenCandy_':
                if (this.candyTagRole === role_01) {
                    role_01['Role'].role_property.defense += 5;
                } else {
                    role_02['Role'].role_property.defense += 5;
                }
                break;
            default:
                break;
        }
    }

    onUpdate(): void {
        // 第一波10个糖果出厂控制，此刻不可点击
        this.timerControl += 0.1;
        if (this.timerControl < 18 && this.self.parent === this.mainSceneControl.candyParent) {
            this.self.y += 3;
        }
        // 飞到主角身上
        this.flyToRole();
        // 下移一格
        if (this.moveAStep) {
            this.moveRules();
            this.moveAStep = false;
        }
    }

    onDisable(): void {
        // 清理动画
        Laya.Tween.clearAll(this);
        if (this.self.name === 'yellowCandy') {
            Laya.Pool.recover('yellowCandy', this.self);
        } else if (this.self.name === 'redCandy___') {
            Laya.Pool.recover('redCandy___', this.self);
        } else if (this.self.name === 'blueCandy__') {
            Laya.Pool.recover('blueCandy__', this.self);
        } else if (this.self.name === 'greenCandy_') {
            Laya.Pool.recover('greenCandy_', this.self);
        }
    }
}