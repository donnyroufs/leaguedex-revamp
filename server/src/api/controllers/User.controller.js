const Controller = require('./Controller');
const { ErrorHandler } = require('../../helpers/error');
const { REFRESH_TOKEN } = require('../../helpers/constants');
const Riot = require('../../lib/Riot');
const { db } = require('../../config/database');

class UserController extends Controller {
  constructor({ model, auth, formatters }) {
    super(model);
    this.Auth = auth;
    this.formatters = formatters;

    this.create = this.create.bind(this);
    this.login = this.login.bind(this);
    this.destroy = this.destroy.bind(this);
    this.refresh = this.refresh.bind(this);
    this.addSummmonerAccount = this.addSummmonerAccount.bind(this);
    this.getRegions = this.getRegions.bind(this);
  }

  async all(req, res) {
    const data = await db.user.findMany({
      select: {
        username: true,
        summoner: {
          select: {
            name: true,
            level: true,
            region: true,
          },
        },
        email: true,
        createdAt: true,
        matchups: {
          select: {
            id: true,
          },
        },
      },
    });

    const formattedData = this.formatters.all(data);

    res.status(200).json(formattedData);
  }

  async create(req, res, next) {
    const { username, password, email } = req.body;

    try {
      const hashedPassword = await this.Auth.hashPassword(password);
      await this.model.create({
        data: {
          username,
          password: hashedPassword,
          email,
        },
      });

      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    const { username, password } = req.body;

    try {
      const user = await this.model.findOne({
        where: {
          username,
        },
        select: {
          id: true,
          username: true,
          password: true,
          summoner: true,
          permissions: true,
        },
      });

      if (!user) throw new ErrorHandler(403, 'User or password is not valid.');

      const validPassword = await this.Auth.isValidPassword(
        password,
        user.password
      );

      if (!validPassword) {
        throw new ErrorHandler(403, 'Username or password is not valid.');
      }

      const payload = {
        data: {
          id: user.id,
          username: user.username,
          summoner: user.summoner,
          permissions: user.permissions,
        },
      };

      const { token: accessToken } = await this.Auth.createToken(payload);

      const { token: refreshToken } = await this.Auth.createToken(
        payload,
        REFRESH_TOKEN
      );

      await this.Auth.createOrUpdateRefreshToken(user.id, refreshToken);

      this.Auth.setRefreshCookie(res, refreshToken);

      res.status(200).json({
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    const userId = req.user.id;

    try {
      this.Auth.removeRefreshToken(userId);
      this.Auth.setRefreshCookie(res, null, 0);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const payload = {
        data: req.user,
      };

      const { token: refreshToken } = await this.Auth.createToken(
        payload,
        REFRESH_TOKEN
      );

      await this.Auth.createOrUpdateRefreshToken(req.user.id, refreshToken);

      this.Auth.setRefreshCookie(res, refreshToken);

      const { token: accessToken } = await this.Auth.createToken(payload);

      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  }

  async addSummmonerAccount(req, res, next) {
    const { summonerName, region } = req.body;

    try {
      const data = await Riot.getSummoner(summonerName, region);

      if (!data) throw ErrorHandler(404, 'Could not find the summoner.');

      const addedSummoner = await db.summoner.create({
        data: {
          accountId: data.id,
          name: data.name,
          level: data.summonerLevel,
          region: region,
          user: {
            connect: {
              id: Number(req.user.id),
            },
          },
        },
      });

      const updateAccountPermissions = await this.model.update({
        where: {
          id: Number(req.user.id),
        },
        data: {
          permissions: 2,
        },
      });

      if (!updateAccountPermissions)
        throw ErrorHandler(500, 'Could not update permissions.');

      const payload = {
        data: {
          ...req.user,
          summoner: addedSummoner,
          permissions: 2,
        },
      };

      const { token: refreshToken } = await this.Auth.createToken(
        payload,
        REFRESH_TOKEN
      );

      await this.Auth.createOrUpdateRefreshToken(req.user.id, refreshToken);

      this.Auth.setRefreshCookie(res, refreshToken);

      const { token: accessToken } = await this.Auth.createToken(payload);

      res.status(201).json({ accessToken });
    } catch (err) {
      next(err);
    }
  }

  getRegions(_, res) {
    const data = Riot.getRegions();
    res.status(200).json(data);
  }
}

module.exports = UserController;
