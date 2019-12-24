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
    private candytagRole: Laya.Sprite;
    /**助手*/
    private friend: Laya.Sprite;
    private friHealth: Laya.ProgressBar;
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
        this.friend = this.mainSceneControl.friend;
        this.friHealth = this.friend.getChildByName('health') as Laya.ProgressBar;
        this.candytagRole = null;

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
        let name = self.owner.name;
        let candyType = name.substring(0, 11);
        // 初次碰撞把唯一的名称放进数组
        if (otherName === 'induction') {
            this.nameArr.push(name);
        } else if (otherName === 'yellowRole' || otherName === 'redRole') {
            this.self.removeSelf();
            // 防止报错
            if (this.candytagRole === null) {
                return;
            }

            // 加血糖果,如果满血则加1000分
            if (candyType === 'addBlood___') {
                let tagHealth = this.candytagRole.getChildByName('health') as Laya.ProgressBar;
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

            // 黑色糖果也出现一个敌人,这个敌人如果是左边，就直接攻击主角，如果在右边优先攻击助手
            // 但是要判断当前点击的主角是哪边,只有右边才能攻击friend
            if (candyType === 'blackCandy_') {
                this.enemyTarget();
                return;
            }

            // 普通糖果无任何特殊事件
            let pairName = candyType + otherName;
            let matching_01 = 'yellowCandy' + 'yellowRole';
            let matching_02 = 'redCandy___' + 'redRole';
            if (pairName === matching_01 || pairName === matching_02) {
                this.scoreLabel.text = (Number(this.scoreLabel.text) + 100).toString();
                // 复活，还剩一个主角的时候才有复活选项
                if (this.roleParent._children.length === 1) {
                    this.mainSceneControl.rescueNum++;
                }
            } else {
                this.enemyTarget();
            }
        }
    }

    /**
     * 给予敌人攻击目标确定规则
     * 如果点击的是左边的主角，那么直接去左边
     * 如果点击的是右边的主角，那么先判断助手死了没有
     * */
    enemyTarget() {
        this.mainSceneControl.enemyAppear = true;
        if (this.candytagRole.name === 'role_01') {
            this.mainSceneControl.enemytagRole = this.candytagRole;
        } else if (this.candytagRole.name === 'role_02') {
            // 助手死亡则寻找右边目标，右边目标必定没死，否则游戏结束了
            if (this.friHealth.value >= 0) {
                let mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
                this.mainSceneControl.enemyAppear = true;
                this.mainSceneControl.enemytagRole = this.mainSceneControl.friend;
            } else {
                // 目标不变
            }
        }
    }

    onTriggerStay(other: any, self: any, contact: any): void {
    }

    // 和感应区碰撞结束之后，如果没有被吃，那么也会出现一个敌人
    // 消失规则是如果没有目标对象的时候就会被删掉
    // 如果没有目标对象，那么会直接消失，有的话移动到目标对象
    // 如果没有目标对象并且还是黑色糖果，那么他的移动目标是助手friend，
    // 并且助手friend不会掉血也不会出现怪物
    onTriggerExit(other: any, self: any, contact: any): void {
        // 碰撞结束删掉名称
        let otherName = other.owner.name;
        if (otherName === 'induction') {
            for (let i = 0; i < this.nameArr.length; i++) {
                if (this.nameArr[i] === self.owner.name) {
                    this.nameArr.splice(i, 1);
                }
            }
        }
        // 没有目标对象
        if (this.candytagRole === null) {
            // 糖果类型名称
            let name = self.owner.name;
            let candyType = name.substring(0, 11);
            if (candyType === 'blackCandy_') {
                this.candytagRole = this.mainSceneControl.friend;
            } else {
                this.self.removeSelf();
                // this.mainSceneControl.tagRole =this.mainSceneControl.friend;
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

        // 判断去向
        if (this.candytagRole === null) {
            this.self.y += this.speed;
        } else {
            // 如果this.targetRole从父节点移除了，那么糖果直接下落
            if (this.candytagRole.parent === null) {
                this.self.y += 3;
            } else {
                // //  如果是黑色糖果碰到助手friend，那么会被助手吃掉
                if (Math.abs(this.mainSceneControl.friend.x - this.self.x) > 10 && Math.abs(this.mainSceneControl.friend.y - this.self.y) > 10) {
                    this.self.removeSelf();
                }

                // x,y分别相减是两点连线向量
                let point = new Laya.Point(this.candytagRole.x - this.self.x, this.candytagRole.y - this.self.y);
                // 归一化，向量长度为1。
                point.normalize();
                //向量相加
                this.self.x += point.x * this.speed * 15 / 8;
                this.self.y += point.y * this.speed * 15 / 8;

            }
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