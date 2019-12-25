import MainSceneControl from "./MainSceneControl";
export default class Candy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**自己身上的碰撞框*/
    private rig: Laya.RigidBody;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;

    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameArr: Array<string>;
    /**糖果运行的速度*/
    private speed: number;

    /**糖果移动对象*/
    private candyTagRole: Laya.Sprite;
    /**主角的父节点*/
    private roleParent: Laya.Sprite;

    /**感应区*/
    private induction: Laya.Sprite;

    /**得分显示*/
    public scoreLabel: Laya.Label;

    constructor() { super(); }
    onEnable(): void {
        this.initProperty();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件

        this.roleParent = this.mainSceneControl.roleParent;
        this.candyTagRole = null;

        this.nameArr = this.mainSceneControl.nameArr;
        this.scoreLabel = this.mainSceneControl.scoreLabel;
        this.rig = this.self.getComponent(Laya.RigidBody) as Laya.RigidBody;
        this.rig.linearVelocity = { x: 0, y: 0.1 };//此处y值必须不等于0才能正常检测碰撞，并不知道为何
        this.speed = 6;

        this.induction = this.mainSceneControl.induction;
    }

    onTriggerEnter(other: any, self: any, contact: any): void {
        // 和糖果碰撞的物体名称
        let otherName: string = other.owner.name;
        // 糖果类型名称
        let selfName = self.owner.name;
        let candyName = selfName.substring(0, 11);
        switch (otherName) {
            case 'induction':
                this.nameArr.push(selfName);
                break;
            case 'yellowRole':
                this.candyAndRole(candyName, other);
                break;
            case 'redRole':
                this.candyAndRole(candyName, other);
                break;
            default:
                break;
        }
    }
    /**不同糖果和角色碰撞规则*/
    candyAndRole(candyName: string, other: Laya.RigidBody): void {
        this.self.removeSelf();
        //加血糖果
        if (candyName === 'addBlood___') {
            let tagHealth = this.candyTagRole.getChildByName('health') as Laya.ProgressBar;
            if (tagHealth.value >= 1) {
                this.scoreLabel.text = (Number(this.scoreLabel.text) + 1000).toString();
            } else {
                tagHealth.value += 0.2;
                if (tagHealth.value >= 1) {
                    tagHealth.value = 1;
                }
            }
            return;
        }
        // 如果不是加血糖果那就需要匹配

        let nameMerge = other.owner.name + candyName;
        let combination_01 = 'yellowRole' + 'yellowCandy';
        let combination_02 = 'redRole' + 'redCandy___';
        if (nameMerge===combination_01||nameMerge===combination_02) {
            this.scoreLabel.text = (Number(this.scoreLabel.text) + 50).toString();
        }else{
            this.mainSceneControl.enemyAppear = true;
            this.mainSceneControl.enemyTagRole = other.owner.parent;
        }
    }

    /**
     * 给予敌人攻击目标确定规则
     * 如果点击的是左边的主角，那么直接去左边
     * */
    enemyTarget_Role(): void {
        this.mainSceneControl.enemyAppear = true;
        if (this.candyTagRole.name === 'role_01') {
            this.mainSceneControl.enemyTagRole = this.candyTagRole;
        } else if (this.candyTagRole.name === 'role_02') {
            // 目标不变
        }
    }

    onTriggerStay(other: any, self: any, contact: any): void { };
    // 碰撞结束之后无论何种糖果都会被从感应区除名
    // 并且爆炸然后出现一个敌人
    onTriggerExit(other: any, self: any, contact: any): void {
        // 碰撞结束从感应区除名
        let otherName = other.owner.name;
        if (otherName === 'induction') {
            for (let i = 0; i < this.nameArr.length; i++) {
                if (this.nameArr[i] === self.owner.name) {
                    this.nameArr.splice(i, 1);
                }
            }
        }
        if (this.candyTagRole === null) {
            this.self.removeSelf();
            if (this.mainSceneControl.roleParent._children.length === 2) {
                this.mainSceneControl.enemyAppear = true;
                let number = Math.floor(Math.random() * 2);
                if (number === 1) {
                    this.mainSceneControl.enemyTagRole = this.mainSceneControl.role_01;
                } else {
                    this.mainSceneControl.enemyTagRole = this.mainSceneControl.role_02;
                }
            } else if (this.mainSceneControl.roleParent._children.length === 1) {
                this.mainSceneControl.enemyTagRole = this.mainSceneControl.roleParent._children[0];
            }
        }
    }

    onUpdate(): void {
        // 主角全部死亡时停止移动
        if (this.roleParent._children.length === 0) {
            this.rig.linearVelocity = { x: 0, y: 0 };
            return;
        }

        // 超出范围消失
        if (this.self.y > Laya.stage.height + 100 || this.self.y < 0 - 100 || this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // 向目标方向移动
        if (this.candyTagRole === null) {
            this.self.y += this.speed;
        } else {
            // x,y分别相减是两点连线向量
            let point = new Laya.Point(this.candyTagRole.x - this.self.x, this.candyTagRole.y - this.self.y);
            // 归一化，向量长度为1。
            point.normalize();
            //向量相加
            this.self.x += point.x * this.speed * 15 / 8;
            this.self.y += point.y * this.speed * 15 / 8;
        }
    }

    onDisable(): void {
        if (this.self.name === 'yellowCandy') {
            Laya.Pool.recover('yellowCandy', this.self);
        } else if (this.self.name === 'redCandy___') {
            Laya.Pool.recover('redCandy___', this.self);
        }
    }
}